// This file is responsible for bundling the SDK by copying necessary files from the source directory to the distribution directory.

import { promises as fs } from "node:fs";
import path from "node:path";

const srcDir = path.resolve("src");
const distDir = path.resolve("dist");
await fs.mkdir(distDir, { recursive: true });

async function copy(dir) {
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const e of ents) {
    const from = path.join(dir, e.name);
    const rel = path.relative(srcDir, from);
    const to = path.join(distDir, rel);
    if (e.isDirectory()) {
      await fs.mkdir(to, { recursive: true });
      await copy(from);
    } else if (e.isFile() && (e.name.endsWith(".ts") || e.name.endsWith(".js") || e.name.endsWith(".d.ts"))) {
      await fs.copyFile(from, to);
    }
  }
}

await copy(srcDir);