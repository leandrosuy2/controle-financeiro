const fs = require("fs");
const path = require("path");

const appJsonPath = path.join(__dirname, "..", "app.json");
const packageJsonPath = path.join(__dirname, "..", "package.json");

function bumpVersion(version) {
  const parts = version.split(".").map(Number);
  if (parts.length < 3) parts.push(0, 0);
  parts[2] = (parts[2] || 0) + 1; // patch
  return parts.join(".");
}

const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
const expo = appJson.expo || appJson;

// Bump version (ex: 1.0.0 -> 1.0.1)
const currentVersion = expo.version || "1.0.0";
const newVersion = bumpVersion(currentVersion);
expo.version = newVersion;

// Android: versionCode (inteiro, obrigatório para subir na Play Store)
if (!expo.android) expo.android = {};
expo.android.versionCode = (expo.android.versionCode || 1) + 1;

// iOS: buildNumber (string ou número)
if (!expo.ios) expo.ios = {};
const currentBuild = expo.ios.buildNumber;
const nextBuild = currentBuild ? String(Number(currentBuild) + 1) : "2";
expo.ios.buildNumber = nextBuild;

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + "\n", "utf8");

// Sincroniza package.json version
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n", "utf8");

console.log(`Versão atualizada: ${currentVersion} → ${newVersion} (Android versionCode: ${expo.android.versionCode}, iOS build: ${expo.ios.buildNumber})`);
