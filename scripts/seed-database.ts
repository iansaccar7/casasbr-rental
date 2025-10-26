import { drizzle } from "drizzle-orm/mysql2";
import { properties } from "../drizzle/schema";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL não está definida");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  // Ler dados do arquivo JSON
  const seedDataPath = path.join(__dirname, "seed-data.json");
  const seedData = JSON.parse(fs.readFileSync(seedDataPath, "utf-8"));

  console.log(`Inserindo ${seedData.length} propriedades no banco de dados...`);

  // Inserir em lotes de 50
  const batchSize = 50;
  for (let i = 0; i < seedData.length; i += batchSize) {
    const batch = seedData.slice(i, i + batchSize);
    await db.insert(properties).values(batch);
    console.log(`✓ Inseridas ${Math.min(i + batchSize, seedData.length)} de ${seedData.length} propriedades`);
  }

  console.log("✓ Seed concluído com sucesso!");
}

seedDatabase().catch((error) => {
  console.error("Erro ao fazer seed do banco de dados:", error);
  process.exit(1);
});

