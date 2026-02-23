// Unset ELECTRON_RUN_AS_NODE which VS Code's terminal sets,
// causing the Electron binary to run as plain Node.js.
delete process.env.ELECTRON_RUN_AS_NODE;
delete process.env.ELECTRON_NO_ATTACH_CONSOLE;

const { execSync } = require("child_process");
try {
  execSync("npx electron-vite dev", { stdio: "inherit", env: process.env });
} catch {
  // electron-vite exits non-zero on window close
}
