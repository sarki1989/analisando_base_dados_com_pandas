-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" TEXT NOT NULL DEFAULT 'vendedor',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "cnpj" TEXT,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "setor" TEXT NOT NULL,
    "produtoInteresse" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Novo',
    "origem" TEXT,
    "valorEstimado" REAL,
    "observacoes" TEXT,
    "motivoPerda" TEXT,
    "consentimentoLgpd" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "ultimoContatoEm" DATETIME,
    "proximaAcaoEm" DATETIME,
    "responsavelId" TEXT,
    CONSTRAINT "Lead_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Atribuicao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "gclid" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "paginaLanding" TEXT,
    "referrer" TEXT,
    "dispositivo" TEXT,
    "primeiroCliqueEm" DATETIME,
    "cliqueWhatsappId" TEXT,
    CONSTRAINT "Atribuicao_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "direcao" TEXT NOT NULL,
    "resumo" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    CONSTRAINT "Interacao_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Interacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tarefa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "vencimentoEm" DATETIME NOT NULL,
    "concluidaEm" DATETIME,
    "prioridade" TEXT NOT NULL DEFAULT 'média',
    "responsavelId" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tarefa_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Tarefa_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "diametro" TEXT,
    "unidade" TEXT NOT NULL DEFAULT 'un',
    "custoFornecedor" REAL,
    "precoBase" REAL NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Cotacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'rascunho',
    "emitidaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validadeDias" INTEGER NOT NULL DEFAULT 15,
    "condicaoPagamento" TEXT,
    "prazoFabricacao" TEXT,
    "frete" TEXT,
    "observacoes" TEXT,
    "subtotal" REAL NOT NULL DEFAULT 0,
    "desconto" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL DEFAULT 0,
    "motivoPerda" TEXT,
    "revisaoDeId" TEXT,
    "revisaoNumero" INTEGER NOT NULL DEFAULT 1,
    "usuarioId" TEXT,
    CONSTRAINT "Cotacao_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Cotacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemCotacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cotacaoId" TEXT NOT NULL,
    "produtoId" TEXT,
    "descricaoLivre" TEXT,
    "quantidade" REAL NOT NULL,
    "precoUnitario" REAL NOT NULL,
    "desconto" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ItemCotacao_cotacaoId_fkey" FOREIGN KEY ("cotacaoId") REFERENCES "Cotacao" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemCotacao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CliqueWhatsapp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "gclid" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "origem" TEXT,
    "paginaLanding" TEXT,
    "dispositivo" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vinculadoEm" DATETIME,
    "leadId" TEXT,
    CONSTRAINT "CliqueWhatsapp_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConfiguracaoEmpresa" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "inscricaoEstadual" TEXT,
    "endereco" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "site" TEXT,
    "banco" TEXT,
    "agencia" TEXT,
    "conta" TEXT,
    "pixChave" TEXT,
    "logoUrl" TEXT,
    "corPrimaria" TEXT NOT NULL DEFAULT '#1A1D21',
    "corAcento" TEXT NOT NULL DEFAULT '#E2601A',
    "impostoPercent" REAL NOT NULL DEFAULT 4,
    "margemPercent" REAL NOT NULL DEFAULT 10,
    "despesasPercent" REAL NOT NULL DEFAULT 5,
    "validadeDiasPadrao" INTEGER NOT NULL DEFAULT 15,
    "whatsappNumero" TEXT NOT NULL DEFAULT '5511940894977',
    "rodapePdf" TEXT
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "detalhe" TEXT,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_responsavelId_idx" ON "Lead"("responsavelId");

-- CreateIndex
CREATE UNIQUE INDEX "Atribuicao_leadId_key" ON "Atribuicao"("leadId");

-- CreateIndex
CREATE INDEX "Interacao_leadId_idx" ON "Interacao"("leadId");

-- CreateIndex
CREATE INDEX "Tarefa_vencimentoEm_idx" ON "Tarefa"("vencimentoEm");

-- CreateIndex
CREATE INDEX "Tarefa_responsavelId_idx" ON "Tarefa"("responsavelId");

-- CreateIndex
CREATE UNIQUE INDEX "Produto_sku_key" ON "Produto"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Cotacao_numero_key" ON "Cotacao"("numero");

-- CreateIndex
CREATE INDEX "Cotacao_leadId_idx" ON "Cotacao"("leadId");

-- CreateIndex
CREATE INDEX "Cotacao_status_idx" ON "Cotacao"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CliqueWhatsapp_codigo_key" ON "CliqueWhatsapp"("codigo");

-- CreateIndex
CREATE INDEX "CliqueWhatsapp_leadId_idx" ON "CliqueWhatsapp"("leadId");

-- CreateIndex
CREATE INDEX "CliqueWhatsapp_criadoEm_idx" ON "CliqueWhatsapp"("criadoEm");

-- CreateIndex
CREATE INDEX "AuditLog_entidade_entidadeId_idx" ON "AuditLog"("entidade", "entidadeId");
