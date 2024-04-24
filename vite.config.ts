import { defineConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import solidPlugin from "vite-plugin-solid";

export default () => {
  return defineConfig({
    plugins: [solidPlugin(), cssInjectedByJsPlugin()],
  });
};
