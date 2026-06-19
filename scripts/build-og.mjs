import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = join(__dirname, "..", "public", "og-default.svg");
const pngPath = join(__dirname, "..", "public", "og-default.png");

const svg = readFileSync(svgPath);

const png = await sharp(svg, { density: 200 })
  .resize(1200, 630, { fit: "cover" })
  .png({ quality: 95, compressionLevel: 9 })
  .toBuffer();

writeFileSync(pngPath, png);
console.log("✓ Wrote", pngPath, "—", png.length, "bytes");
