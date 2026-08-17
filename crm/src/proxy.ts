import { auth } from "@/auth";
import { NextResponse } from "next/server";

const ROTAS_PUBLICAS = ["/login"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const ehRotaPublica = ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota));

  if (!req.auth && !ehRotaPublica) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (req.auth && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  // Protege tudo, exceto: rotas públicas de captura (/r/*, inbound), auth,
  // arquivos estáticos e assets do Next.
  matcher: [
    "/((?!api/auth|api/leads/inbound|r/whatsapp|_next/static|_next/image|favicon.ico).*)",
  ],
};
