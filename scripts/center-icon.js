/**
 * Gera ícone e splash centralizados a partir de PNGs com muito espaço transparente.
 * 1. Ícone: trim + centraliza em 1024x1024 (margem segura Android).
 * 2. Splash: trim + redimensiona para caber sem cortar (largura máx 180px).
 *
 * Uso: node scripts/center-icon.js
 * Requer: npm install --save-dev sharp
 */

const path = require("path");
const fs = require("fs");

const root = path.join(__dirname, "..");
const assets = path.join(root, "assets", "images");

const INPUT_ICON = path.join(assets, "splash-icon.png");
const INPUT_SPLASH = path.join(assets, "logo.png");
const OUTPUT_ICON = path.join(assets, "icon-app-1024.png");
const OUTPUT_SPLASH = path.join(assets, "logo-splash.png");

const ICON_SIZE = 1024;
const SAFE_ZONE = 2 / 3; // conteúdo no centro 2/3 (recomendação Android)
const SPLASH_MAX_WIDTH = 180;

if (!fs.existsSync(INPUT_ICON)) {
  console.error("Não encontrado:", INPUT_ICON);
  process.exit(1);
}
if (!fs.existsSync(INPUT_SPLASH)) {
  console.error("Não encontrado:", INPUT_SPLASH);
  process.exit(1);
}

async function main() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.error("Instale sharp: npm install --save-dev sharp");
    process.exit(1);
  }

  const safePx = Math.floor(ICON_SIZE * SAFE_ZONE);

  // Ícone: trim + encaixar no centro com margem segura
  const iconTrimmed = await sharp(INPUT_ICON)
    .trim({ threshold: 1 })
    .toBuffer();
  const iconResized = await sharp(iconTrimmed)
    .resize(safePx, safePx, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: ICON_SIZE,
      height: ICON_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .composite([{ input: iconResized, gravity: "center" }])
    .toFile(OUTPUT_ICON);

  console.log("Ícone gerado:", OUTPUT_ICON);

  // Splash: trim + redimensionar para não cortar
  await sharp(INPUT_SPLASH)
    .trim({ threshold: 1 })
    .resize(SPLASH_MAX_WIDTH, null, { fit: "inside" })
    .png()
    .toFile(OUTPUT_SPLASH);

  console.log("Splash gerado:", OUTPUT_SPLASH);
  console.log("\nApp.json já está configurado para usar esses arquivos.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
