import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { gerarCodigoClique, detectarDispositivo } from "@/lib/codigo-clique";
import { linkWhatsapp } from "@/lib/format";

export const runtime = "nodejs";

/**
 * Redirecionador público usado nos botões de WhatsApp do site (Wix).
 * Grava a origem do clique (gclid/utm/referrer/origem) e manda o visitante
 * para o wa.me com uma mensagem pré-preenchida contendo um código curto
 * (ex: SB-7F3K), que depois é usado para vincular a conversa a um Lead.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const dados = {
    gclid: searchParams.get("gclid") || null,
    utmSource: searchParams.get("utm_source") || null,
    utmMedium: searchParams.get("utm_medium") || null,
    utmCampaign: searchParams.get("utm_campaign") || null,
    utmTerm: searchParams.get("utm_term") || null,
    utmContent: searchParams.get("utm_content") || null,
    origem: searchParams.get("origem") || null,
    paginaLanding: searchParams.get("pagina") || request.headers.get("referer") || null,
    referrer: request.headers.get("referer") || null,
    userAgent: request.headers.get("user-agent") || null,
    dispositivo: detectarDispositivo(request.headers.get("user-agent")),
  };

  const clique = await criarCliqueComCodigoUnico(dados);

  const config = await prisma.configuracaoEmpresa.findUnique({ where: { id: "default" } });
  const numero = config?.whatsappNumero || process.env.WHATSAPP_NUMERO || "5511940894977";

  const mensagem = `Olá! Vim pelo site (ref. ${clique.codigo}) e gostaria de uma cotação de...`;

  return NextResponse.redirect(linkWhatsapp(numero, mensagem), { status: 302 });
}

type DadosClique = {
  gclid: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  origem: string | null;
  paginaLanding: string | null;
  referrer: string | null;
  userAgent: string | null;
  dispositivo: string;
};

async function criarCliqueComCodigoUnico(dados: DadosClique) {
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    try {
      return await prisma.cliqueWhatsapp.create({
        data: { ...dados, codigo: gerarCodigoClique() },
      });
    } catch (e) {
      const colisaoDeCodigo =
        e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
      if (!colisaoDeCodigo) throw e;
    }
  }
  throw new Error("Não foi possível gerar um código de clique único.");
}
