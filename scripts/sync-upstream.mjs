import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { get } from "node:https";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const metadata = JSON.parse(readFileSync(join(root, "vendor", "upstream.json"), "utf8"));
const url = `https://raw.githubusercontent.com/${metadata.repository}/${metadata.commit}/${metadata.path}`;

function download(source) {
  return new Promise((resolve, reject) => {
    get(source, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        resolve(download(response.headers.location));
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Upstream download failed with HTTP ${response.statusCode}`));
        response.resume();
        return;
      }
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}

const source = await download(url);
const digest = createHash("sha256").update(source).digest("hex");
if (digest !== metadata.sha256) {
  throw new Error(`Pinned upstream checksum mismatch: expected ${metadata.sha256}, got ${digest}`);
}
writeFileSync(join(root, "vendor", "magic_mapper.py"), source);
console.log(`Synced ${metadata.repository}@${metadata.commit}`);
