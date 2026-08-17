import type { DefaultSession } from "next-auth";
import type { PapelUsuario } from "@/lib/enums";

declare module "next-auth" {
  interface User {
    papel: PapelUsuario;
  }

  interface Session {
    user: {
      id: string;
      papel: PapelUsuario;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    papel: PapelUsuario;
  }
}
