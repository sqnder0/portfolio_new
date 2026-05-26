import { spawn } from "node:child_process";

const port = Number.parseInt(process.env.PORT ?? "4173", 10);
const resolvedPort = Number.isFinite(port) && port > 0 ? String(port) : "4173";

const child = spawn(
  process.execPath,
  [
    "./node_modules/vite/bin/vite.js",
    "preview",
    "--host",
    "0.0.0.0",
    "--port",
    resolvedPort,
  ],
  { stdio: "inherit", env: process.env }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error("Failed to start Vite preview:", error.message);
  process.exit(1);
});
