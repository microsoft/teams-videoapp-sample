import mkcert from "vite-plugin-mkcert";
import path from "node:path";
import { splitVendorChunkPlugin } from "vite";
export default {
  base: "/t2.1/",
  build: {
    outDir: "./dist",
  },
  resolve: {
    alias: {
      "@microsoft/teams-js": path.resolve(
        __dirname,
        "node_modules/@microsoft/teams-js/dist/MicrosoftTeams.js"
      ),
    },
  },
  plugins: [mkcert(), splitVendorChunkPlugin()],
  server: {
    https: true,
  },
};
