import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const app = JSON.parse(readFileSync(join(root, "appinfo.json"), "utf8"));
const releaseRepository = process.env.GITHUB_REPOSITORY || "afonsojramos/magic-mapper-webos";
const sourceRepository = process.env.SOURCE_REPOSITORY || "afonsojramos/magic-mapper-webos";
const ipkName = `${app.id}_${app.version}_all.ipk`;
const ipkPath = join(root, "dist", ipkName);
const manifestPath = join(root, "dist", `${app.id}.manifest.json`);
const sha256 = createHash("sha256").update(readFileSync(ipkPath)).digest("hex");

const manifest = {
  id: app.id,
  version: app.version,
  type: app.type,
  title: app.title,
  appDescription: "Discover, disable, and remap LG Magic Remote buttons from the TV",
  iconUri: `https://github.com/${releaseRepository}/releases/latest/download/${basename(app.largeIcon)}`,
  sourceUrl: `https://github.com/${sourceRepository}`,
  rootRequired: true,
  ipkUrl: ipkName,
  ipkHash: { sha256 },
};

writeFileSync(manifestPath, `${JSON.stringify(manifest)}\n`);
console.log(manifestPath);

const releaseTag = process.env.RELEASE_TAG || `v${app.version}`;
const repoPath = join(root, "dist", "repo.json");
const repo = {
  paging: { page: 1, count: 1, maxPage: 1, itemsTotal: 1 },
  packages: [
    {
      id: manifest.id,
      title: manifest.title,
      iconUri: manifest.iconUri,
      manifest: {
        ...manifest,
        ipkUrl: `https://github.com/${releaseRepository}/releases/download/${releaseTag}/${ipkName}`,
      },
    },
  ],
};

writeFileSync(repoPath, `${JSON.stringify(repo, null, 2)}\n`);
console.log(repoPath);
