-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "cotacaoId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aguardando compra',
    "fornecedor" TEXT,
    "numeroPedidoFornecedor" TEXT,
    "transportadora" TEXT,
    "codigoRastreio" TEXT,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Pedido_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pedido_cotacaoId_fkey" FOREIGN KEY ("cotacaoId") REFERENCES "Cotacao" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Pedido_leadId_idx" ON "Pedido"("leadId");

-- CreateIndex
CREATE INDEX "Pedido_status_idx" ON "Pedido"("status");
