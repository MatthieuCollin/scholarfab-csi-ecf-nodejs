import path from "node:path";
import { availableParallelism } from "node:os";
import cluster from "node:cluster";
import { readFile } from "node:fs/promises";

import { fileURLToPath } from "node:url";

import sqlite3 from "sqlite3";
import { KeyStore } from "./app/services/keystore.service.mjs";
import { setupDatabase } from "./app/services/database.service.mjs";

import { createApplication } from "./app/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL(".", import.meta.url));

const PORT = 3000;
const ADDR = "127.0.0.1";

async function setup() {
  const filename = path.join(__dirname, "data", "app.db");
  const schema = path.join(__dirname, "data", "schema.sql");

  console.log(`Master ${process.pid}\tSetting up database ...`);
  const db = await setupDatabase({ filename, schema });

  console.log(`Master ${process.pid}\tSetting up keystore ...`);
  const ks = KeyStore.getInstance(db);
  const keys = await ks.getKeys();
  if (keys.length == 0) {
    await ks.setKeys();
  }
}

(async function main() {
  if (cluster.isPrimary) {
    const WORKERS = availableParallelism();

    console.log(`Master ${process.pid}\tStarting...`);
    await setup();

    for (let i = 0; i < WORKERS; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
      console.log(`Worker ${worker.pid} exited with code ${code}...`);
    });
  } else {
    const __rootdir = __dirname;
    const app = await createApplication({ __rootdir });
    app.listen(PORT, ADDR, () => {
      console.log(`Worker ${process.pid}\tRunning...`);
    });
  }
})();
