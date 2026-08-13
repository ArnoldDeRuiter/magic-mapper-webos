import { createHash } from "node:crypto";
import { cpSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const stage = join(root, "build", "app");
const output = join(root, "dist");
const files = [
  "LICENSE",
  "THIRD_PARTY_NOTICES.md",
  "appinfo.json",
  "assets",
  "css",
  "icon.png",
  "index.html",
  "js",
  "largeIcon.png",
  "runtime",
  "vendor",
];

const upstream = JSON.parse(readFileSync(join(root, "vendor", "upstream.json"), "utf8"));
const upstreamDigest = createHash("sha256")
  .update(readFileSync(join(root, "vendor", "magic_mapper.py")))
  .digest("hex");
if (upstreamDigest !== upstream.sha256) {
  throw new Error("Vendored Magic Mapper does not match vendor/upstream.json; run npm run sync-upstream");
}

if (!stage.startsWith(join(root, "build"))) {
  throw new Error("Refusing to clean a packaging directory outside build/");
}
rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
mkdirSync(output, { recursive: true });
for (const file of files) {
  cpSync(join(root, file), join(stage, file), { recursive: true });
}
rmSync(join(stage, "runtime", "__pycache__"), { recursive: true, force: true });
rmSync(join(stage, "vendor", "__pycache__"), { recursive: true, force: true });

const packager = join(root, "node_modules", ".bin", "ares-package");
const result = spawnSync(packager, [stage, "--outdir", output], { stdio: "inherit" });
process.exit(result.status ?? 1);
