// Gera um dump datado do banco de dados em /backups.
// - SQLite (dev): copia o arquivo do banco.
// - PostgreSQL (produção): roda `pg_dump` (precisa estar instalado no ambiente).
import "dotenv/config";
import { existsSync, mkdirSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

function timestamp() {
  const agora = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${agora.getFullYear()}${pad(agora.getMonth() + 1)}${pad(agora.getDate())}-${pad(agora.getHours())}${pad(agora.getMinutes())}${pad(agora.getSeconds())}`;
}

function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL não definida. Configure o .env antes de rodar o backup.");
    process.exit(1);
  }

  const pastaBackups = path.join(process.cwd(), "backups");
  if (!existsSync(pastaBackups)) mkdirSync(pastaBackups, { recursive: true });

  const ts = timestamp();

  if (databaseUrl.startsWith("file:")) {
    const caminhoOrigem = path.resolve(process.cwd(), "prisma", databaseUrl.replace("file:", ""));
    if (!existsSync(caminhoOrigem)) {
      console.error(`Banco SQLite não encontrado em ${caminhoOrigem}.`);
      process.exit(1);
    }
    const destino = path.join(pastaBackups, `stokes-crm-${ts}.db`);
    copyFileSync(caminhoOrigem, destino);
    console.log(`Backup do SQLite salvo em ${destino}`);
    return;
  }

  if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
    const destino = path.join(pastaBackups, `stokes-crm-${ts}.sql`);
    try {
      execFileSync("pg_dump", [databaseUrl, "-f", destino], { stdio: "inherit" });
      console.log(`Backup do PostgreSQL salvo em ${destino}`);
    } catch (e) {
      console.error(
        "Falha ao rodar pg_dump. Verifique se o cliente PostgreSQL (postgresql-client) está instalado."
      );
      throw e;
    }
    return;
  }

  console.error(`DATABASE_URL com provider não suportado pelo script de backup: ${databaseUrl}`);
  process.exit(1);
}

main();
