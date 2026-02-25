/**
 * electron-builder afterPack hook: embed app icon into the .exe
 * using rcedit. Needed because signAndEditExecutable is disabled
 * (winCodeSign extraction fails on Windows without admin privileges).
 */
const { rcedit } = require("rcedit");
const { readFileSync } = require("fs");
const { resolve } = require("path");

module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== "win32") {
    return;
  }

  const pkg = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf-8"));
  const exePath = resolve(context.appOutDir, "Ink.exe");
  const iconPath = resolve(__dirname, "../resources/icon.ico");

  console.log("  \u2022 setting app icon via rcedit", exePath);

  await rcedit(exePath, {
    icon: iconPath,
    "version-string": {
      ProductName: "Ink",
      FileDescription: pkg.description,
      CompanyName: pkg.author,
      LegalCopyright: "Copyright \u00A9 " + new Date().getFullYear() + " " + pkg.author,
    },
    "file-version": pkg.version,
    "product-version": pkg.version,
  });

  console.log("  \u2022 icon set successfully");
};
