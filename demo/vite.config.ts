import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createReadStream, statSync } from "node:fs";
import { join } from "node:path";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "serve-dat-gz-raw",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Enable SharedArrayBuffer via cross-origin isolation headers
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");

          // Serve .dat.gz files as raw binary (application/octet-stream).
          // Without this, Vite sets Content-Encoding: gzip on .gz files,
          // causing the browser to transparently decompress them before
          // the BrowserLoader's DecompressionStream can process them.
          if (req.url?.endsWith(".dat.gz")) {
            const filePath = join("public", req.url);
            try {
              const stat = statSync(filePath);
              res.writeHead(200, {
                "Content-Type": "application/octet-stream",
                "Content-Length": stat.size,
              });
              createReadStream(filePath).pipe(res);
            } catch {
              next();
            }
            return;
          }
          next();
        });
      },
    },
  ],
});
