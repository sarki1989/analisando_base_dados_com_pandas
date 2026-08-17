import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { deArrayParaJSON } from "@/lib/json-array";
import { inboundLeadSchema } from "@/lib/validation/inbound";

export const runtime = "nodejs";

/**
 * Endpoint público para captura de leads por formulário (Wix/Zapier/etc),
 * protegido por token fixo (não é para uso do navegador do cliente final).
 * Ver README para o passo a passo de configuração no Wix.
 */
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const tokenEsperado = process.env.INBOUND_API_TOKEN;

  if (!tokenEsperado || auth !== `Bearer ${tokenEsperado}`) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
  }

  const parsed = inboundLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { erro: "Payload inválido.", detalhes: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { produto_interesse, consentimento_lgpd, ...dados } = parsed.data;
  const temUtm = [
    dados.gclid,
    dados.utm_source,
    dados.utm_medium,
    dados.utm_campaign,
    dados.utm_term,
    dados.utm_content,
  ].some(Boolean);

  const lead = await prisma.lead.create({
    data: {
      nome: dados.nome,
      empresa: dados.empresa,
      telefone: dados.telefone,
      email: dados.email,
      cidade: dados.cidade,
      uf: dados.uf,
      setor: dados.setor,
      observacoes: dados.observacoes,
      produtoInteresse: deArrayParaJSON(produto_interesse),
      consentimentoLgpd: consentimento_lgpd,
      origem: "formulário do site",
      ...(temUtm && {
        atribuicao: {
          create: {
            gclid: dados.gclid,
            utmSource: dados.utm_source,
            utmMedium: dados.utm_medium,
            utmCampaign: dados.utm_campaign,
            utmTerm: dados.utm_term,
            utmContent: dados.utm_content,
            paginaLanding: dados.pagina_landing,
            referrer: dados.referrer,
            primeiroCliqueEm: new Date(),
          },
        },
      }),
    },
  });

  return NextResponse.json({ id: lead.id }, { status: 201 });
}
