#!/usr/bin/env node
// Tiny wrapper around `next dev -H 0.0.0.0` that prints the real LAN IP(s)
// up-front. Next.js itself only shows the bind host (0.0.0.0) which is not a
// valid browser URL.

import { spawn } from "node:child_process";
import { networkInterfaces } from "node:os";

function getLanUrls(port) {
  const out = [];
  for (const list of Object.values(networkInterfaces())) {
    if (!list) continue;
    for (const i of list) {
      if (i.family === "IPv4" && !i.internal) {
        out.push(`http://${i.address}:${port}`);
      }
    }
  }
  return out;
}

const port = process.env.PORT || "8080";

console.log(`\n  ▲ rangkuman-news (next dev)\n`);
console.log(`  Local:    http://localhost:${port}`);
for (const url of getLanUrls(port)) {
  console.log(`  Network:  ${url}`);
}
console.log("");

const child = spawn("npx", ["next", "dev", "-H", "0.0.0.0", "-p", port], {
  stdio: "inherit",
  shell: true,
});
child.on("exit", (code) => process.exit(code ?? 0));
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));