import { z } from "zod";

import { PAPEIS_USUARIO } from "@/lib/enums";

export const usuarioSchema = z.object({
  nome: z.string().min(1, "Informe o nome"),
  email: z.string().email("E-mail inválido"),
  papel: z.enum(PAPEIS_USUARIO),
  // Na edição, em branco significa "manter a senha atual"; na criação é
  // obrigatória (checado em src/app/actions/usuarios.ts, onde dá pra
  // diferenciar criação de edição).
  senha: z.union([z.string().min(6, "A senha precisa ter ao menos 6 caracteres"), z.literal("")]),
});
