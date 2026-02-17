/**
 * Ritaglia il marker rimuovendo il quadrato bianco, mantiene solo il marker con cornice bianca.
 */
import sharp from "sharp";
import { existsSync } from "fs";
import { join } from "path";

// Ritaglia marker: rimuove quadrato bianco, mantiene solo il pin con cornice che segue il profilo
const src = join(process.cwd(), "public", "marker-pin.png");
const out = join(process.cwd(), "public", "marker-pin.png");

if (!existsSync(src)) {
  console.error("public/marker-pin.png non trovato");
  process.exit(1);
}

const img = sharp(src);
const meta = await img.metadata();
const { width, height } = meta;

// Trim: rimuove pixel bianchi/near-white ai bordi
const trimmed = await sharp(src)
  .trim({ threshold: 15 })
  .toBuffer();

const trimmedMeta = await sharp(trimmed).metadata();
const tw = trimmedMeta.width || width;
const th = trimmedMeta.height || height;

// Piccola cornice trasparente (il bianco segue già il profilo nel marker)
await sharp(trimmed)
  .extend({
    top: 3,
    bottom: 3,
    left: 3,
    right: 3,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(out);

console.log("Marker ritagliato:", tw, "x", th, "+ 4px cornice");