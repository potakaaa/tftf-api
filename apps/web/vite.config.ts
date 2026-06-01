import { defineConfig } from "vite"
import type { Plugin } from "vite"
import netlify from "@netlify/vite-plugin-tanstack-start"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

import { logger } from "./src/lib/logger"

function requestLogger(): Plugin {
  return {
    name: "tftf-request-logger",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const startedAt = performance.now()

        response.on("finish", () => {
          logger.info("request", {
            method: request.method,
            url: request.url,
            status: response.statusCode,
            durationMs: Number((performance.now() - startedAt).toFixed(2)),
          })
        })

        next()
      })
    },
  }
}

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    requestLogger(),
    devtools(),
    tailwindcss(),
    tanstackStart(),
    netlify(),
    viteReact(),
  ],
})

export default config
