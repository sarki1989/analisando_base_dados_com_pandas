# CRM Stokes Brasil

CRM interno para a Stokes Brasil (ferramentas diamantadas de perfuração):
funil de leads, captura de origem via WhatsApp/Google Ads, cotações em PDF
e dashboard de vendas. Single-tenant, feito para 1–3 usuários internos.

## Stack e decisões técnicas

- **Next.js 16 (App Router) + TypeScript + Tailwind v4**
- **Prisma** — SQLite em dev, PostgreSQL em produção (ver [Trocar para PostgreSQL](#trocar-o-banco-para-postgresql-em-produção))
- **Auth.js v5** (Credentials + JWT) — sem cadastro público; usuários criados por seed/admin
- **Recharts** para os gráficos do dashboard
- **@react-pdf/renderer** para o PDF de cotação — escolhido em vez de Puppeteer
  porque não depende de um binário Chromium (mais leve para rodar num VPS
  pequeno e mais rápido para gerar um documento simples de uma página)
- Componentes de UI no padrão shadcn/ui, escritos à mão neste projeto (sem o
  pacote `shadcn`) sobre Radix UI
- **Vitest** para os testes de lógica de negócio (numeração de cotação,
  cálculo do fator de preço, totais de itens)

## Instalação local

Pré-requisitos: Node.js 20.9+ (recomendado 22+) e npm.

```bash
cd crm
npm install
cp .env.example .env
# gere um valor para AUTH_SECRET (openssl rand -base64 32) e para
# INBOUND_API_TOKEN (openssl rand -hex 24), e cole no .env
npm run db:migrate
npm run db:seed
npm run dev
```

Acesse `http://localhost:3000`. Usuários criados pelo seed:

| E-mail                          | Senha       | Papel     |
| -------------------------------- | ----------- | --------- |
| admin@stokesbrasil.com.br        | stokes123   | admin     |
| vendedor@stokesbrasil.com.br     | stokes123   | vendedor  |

**Troque essas senhas** (ou crie novos usuários e desative estes) antes de
colocar o sistema em uso real — não há tela de "esqueci minha senha"; troca
de senha e criação de usuário hoje são feitas direto no banco (`npm run
db:studio` abre uma interface visual do Prisma para editar a tabela
`Usuario`; o hash é bcrypt).

O seed também cadastra o catálogo de produtos com base na tabela de preços
do fornecedor principal (Prisma Ferramentas Diamantadas) e 5 leads de
exemplo — apague os leads de exemplo antes de usar o sistema em produção.

## Variáveis de ambiente

Ver `.env.example` para a lista completa. As mais importantes:

- `DATABASE_URL` — `file:./dev.db` em dev; string de conexão PostgreSQL em produção
- `AUTH_SECRET` — chave de assinatura de sessão (`openssl rand -base64 32`)
- `INBOUND_API_TOKEN` — token que protege o endpoint `POST /api/leads/inbound`
- `WHATSAPP_NUMERO` — número oficial do WhatsApp da empresa (E.164, sem `+`)
- `NEXT_PUBLIC_APP_URL` — URL pública onde o CRM está hospedado
- `ANTHROPIC_API_KEY` — opcional; habilita o gerador de mensagens com IA
  (sem ela, o recurso mostra um erro amigável ao usar)

## Scripts

```bash
npm run dev          # servidor de desenvolvimento
npm run build         # build de produção
npm run start          # roda o build de produção
npm run lint            # ESLint
npm run test              # testes de unidade (Vitest)
npm run db:migrate         # aplica migrações do Prisma (dev)
npm run db:seed              # roda o seed
npm run db:studio             # interface visual do banco
npm run backup                 # dump datado do banco em /backups
```

## Deploy em produção (Docker + VPS)

O repositório inclui `Dockerfile` e `docker-compose.yml` (app + PostgreSQL).

### Trocar o banco para PostgreSQL em produção

O schema (`prisma/schema.prisma`) usa SQLite em dev de propósito — nenhum
tipo específico do SQLite é usado nos modelos (sem enums nativos, sem
arrays), então a troca é mecânica. **Antes do primeiro deploy**, faça uma
vez só:

1. Em `prisma/schema.prisma`, troque `provider = "sqlite"` para
   `provider = "postgresql"` no bloco `datasource db`.
2. Aponte `DATABASE_URL` para um Postgres real (pode ser o do
   `docker-compose.yml`, um banco gerenciado, etc).
3. Apague `prisma/migrations/` (as migrações do SQLite não são compatíveis
   com Postgres) e rode `npx prisma migrate dev --name init` contra esse
   Postgres para gerar as migrações de produção. Comite a nova pasta
   `prisma/migrations/`.
4. Rode `npm run db:seed` uma vez para popular o catálogo, os usuários e a
   configuração da empresa.

Depois disso, o container roda `prisma migrate deploy` sozinho a cada start
(ver `docker-entrypoint.sh`) — não precisa repetir esse processo, só o passo
1–3 acontece uma vez, na primeira configuração do ambiente de produção.

### Subindo com Docker Compose

```bash
cp .env.example .env   # preencha AUTH_SECRET, INBOUND_API_TOKEN, NEXTAUTH_URL etc.
docker compose build
docker compose up -d
docker compose exec app npm run db:seed   # só na primeira vez
```

O `docker-compose.yml` já sobe um serviço `db` (PostgreSQL 16). Se preferir
usar um Postgres gerenciado externo, remova o serviço `db` do compose e
aponte `DATABASE_URL` para ele.

> **Nota:** o build e o teste do Dockerfile neste ambiente de
> desenvolvimento não puderam ser validados de ponta a ponta — o sandbox
> onde este projeto foi construído bloqueia por política o acesso ao Docker
> Hub. O Dockerfile foi revisado cuidadosamente à mão, mas rode
> `docker compose build` no seu ambiente antes de confiar nele em produção.

### Backup

`npm run backup` (ou `docker compose exec app npm run backup`) gera um dump
datado em `/backups`: copia o arquivo SQLite em dev, ou roda `pg_dump` em
produção (o cliente `postgresql-client` precisa estar disponível — a imagem
Docker deste projeto não o inclui por padrão; adicione
`apt-get install -y postgresql-client` ao `Dockerfile` se for rodar o
backup de dentro do container, ou rode o backup a partir de outra máquina
com acesso ao Postgres).

## Configurando os botões de WhatsApp no Wix

O site é Wix no editor clássico, sem acesso a alterar a estrutura da
página — só é possível trocar o destino (`href`) dos botões existentes.
A captura de origem funciona assim:

1. **Publique o CRM** (ou rode em produção) e anote a URL pública, ex.
   `https://crm.stokesbrasil.com.br`.
2. **Para cada botão de WhatsApp do site**, no editor do Wix, selecione o
   botão → **Link** → **Web Address** → troque o link atual
   (`https://wa.me/5511940894977...`) por:

   ```
   https://crm.stokesbrasil.com.br/r/whatsapp?origem=hero
   ```

   Troque `origem=hero` por um identificador da posição do botão em cada
   página/seção (ex. `origem=rodape`, `origem=mineracao-sondagem`,
   `origem=pagina-coroas-hq`) — isso aparece depois no CRM, na tela de
   leads e no dashboard, como "origem" do clique.

3. **Cole o script abaixo no Wix** para que os cliques carreguem também o
   `gclid` e os `utm_*` da campanha do Google Ads que trouxe o visitante até
   a página (o Wix, sozinho, não faz isso). No editor: **Configurações do
   site → Custom Code** (ou, no editor clássico, **Configurações → Rastreamento
   e Analytics → + Novo código personalizado**) → cole no `</body>`, marcado
   para carregar em **todas as páginas**:

   ```html
   <script>
     (function () {
       var qs = window.location.search;
       if (!qs) return;
       function propagar() {
         document
           .querySelectorAll('a[href*="/r/whatsapp"]')
           .forEach(function (a) {
             if (a.dataset.utmAplicado) return;
             var sep = a.href.indexOf("?") > -1 ? "&" : "?";
             a.href = a.href + sep + qs.slice(1);
             a.dataset.utmAplicado = "1";
           });
       }
       propagar();
       // o Wix pode re-renderizar elementos depois do load inicial —
       // tenta de novo por alguns segundos para não perder botões tardios.
       var tentativas = 0;
       var intervalo = setInterval(function () {
         propagar();
         if (++tentativas > 10) clearInterval(intervalo);
       }, 500);
     })();
   </script>
   ```

   Esse script pega a querystring da página atual (`?utm_source=google&
   utm_campaign=...&gclid=...`, que o Google Ads/GA já adiciona sozinho
   quando alguém clica num anúncio) e a anexa em qualquer link que aponte
   para `/r/whatsapp`, preservando o `origem` que você configurou no passo 2.

4. **Teste:** abra a página com uma querystring de teste, ex.
   `https://www.stokesbrasil.com.br/?utm_source=google&utm_medium=cpc&utm_campaign=teste`,
   clique no botão de WhatsApp e confira em **Cliques sem lead** no CRM se o
   clique apareceu com a campanha `teste`.

5. Ao criar o lead a partir dessa conversa, use o código curto que aparece
   na mensagem pré-preenchida do WhatsApp (ex. `SB-7F3K`) ou escolha o
   clique nas sugestões recentes do formulário — isso preenche a atribuição
   automaticamente.

Referências do ambiente (documentação — integração automática de Google
Ads/GA4/GTM está fora do escopo desta fase): Google Ads `477-634-5047`, GA4
`G-KMXZDL6J31`, GTM `GTM-PX3VS3L`.

### Endpoint alternativo: formulário do site

Se o site tiver (ou vier a ter) um formulário de contato via Wix Forms +
Zapier/Make, ele pode enviar o lead direto para o CRM via
`POST /api/leads/inbound`, com o header `Authorization: Bearer
<INBOUND_API_TOKEN>` e um corpo JSON:

```json
{
  "nome": "João Silva",
  "empresa": "Sondagens Silva Ltda",
  "telefone": "+5511999998888",
  "email": "joao@sondagenssilva.com.br",
  "utm_source": "google",
  "utm_campaign": "coroas-hq",
  "gclid": "..."
}
```

## Escopo e limitações conhecidas

- **Multi-tenancy**, **integração oficial com a API do WhatsApp Business**,
  **automações de e-mail marketing**, **chat interno** e **app mobile
  nativo** ficaram deliberadamente fora do escopo (ver o pedido original).
  A estrutura de dados (`Interacao`, `CliqueWhatsapp`) foi feita para não
  atrapalhar uma futura integração com a API oficial, mas isso não foi
  implementado.
- A busca global (`/api/search`) usa `contains` do Prisma. No SQLite (dev) o
  `LIKE` já é case-insensitive para caracteres ASCII; no PostgreSQL
  (produção) a busca é case-sensitive por padrão — dependendo do volume de
  uso, considere trocar por uma extensão como `pg_trgm` ou normalizar
  (`ILIKE`) se isso incomodar no dia a dia.
- A dependência `xlsx` (SheetJS) tem duas vulnerabilidades conhecidas
  (prototype pollution e ReDoS) que afetam principalmente a **leitura** de
  arquivos não confiáveis; este projeto só a usa para **gerar** exportações
  a partir de dados já validados do próprio banco, o que reduz bastante o
  risco prático, mas vale reavaliar se o pacote ganhar um patch oficial.
- O Dockerfile não foi validado com um build real neste ambiente (ver nota
  na seção de deploy) — revise antes do primeiro deploy.
- **Gerador de mensagens com IA** (botão "Gerar mensagem com IA" no card do
  lead e no card da cotação): gera um rascunho de WhatsApp ou e-mail (dois
  tipos — enviar proposta / retomar contato de negociação parada — e dois
  canais) usando a API da Anthropic. É **opcional**: sem `ANTHROPIC_API_KEY`
  configurada no servidor, o botão continua visível mas mostra um erro
  amigável ao gerar. A mensagem gerada é sempre um rascunho — o usuário
  revisa, edita se quiser e copia/cola ou abre o WhatsApp/e-mail já
  preenchido; **nada é enviado automaticamente pelo sistema**.
- **Kanban de Pedidos** (`/pedidos`): acompanhamento pós-venda, com etapas
  "Aguardando compra" → "Comprado" → "Em trânsito" → "Entregue". Um pedido é
  criado automaticamente quando um lead vira "Ganho" (e a página `/pedidos`
  se auto-recupera para leads que viraram "Ganho" por outro caminho). Cada
  pedido pode ter uma cotação do lead selecionada como **referência** — o
  PDF de "Pedido de Compra" enviado ao fornecedor (Prisma/Sonda Parts/ICEMS
  etc.) é montado a partir dos itens/quantidades dessa cotação, mas usando o
  **custo do fornecedor** (`Produto.custoFornecedor`) como preço unitário —
  nunca o preço de venda cobrado do cliente. Por isso o PDF não traz nome do
  cliente/lead nem o valor da cotação, só fornecedor, itens e custo: é um
  documento interno de compra, não uma via da proposta comercial. Se algum
  item não tiver custo de fornecedor cadastrado, o PDF avisa em vez de
  inventar um valor.

## Estrutura do desenvolvimento

O projeto foi construído em 6 fases, cada uma com commit próprio no
histórico do git, mais duas fases adicionais:

1. Setup, schema Prisma, autenticação, seed, layout e navegação
2. CRUD de leads, funil kanban, interações e tarefas
3. Captura de origem via WhatsApp (`/r/whatsapp`, atribuição, cliques sem lead, inbound)
4. Catálogo de produtos, cotações, calculadora de preço, PDF
5. Dashboard, relatórios, exportação/importação, backup
6. Documentação e deploy (este README)
7. Download rápido da proposta comercial (PDF) no card do lead e gerador de
   mensagens com IA (WhatsApp/e-mail) no card do lead e da cotação
8. Kanban de Pedidos (pós-venda) e PDF de Pedido de Compra ao fornecedor,
   gerado a partir da cotação do cliente
