import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [starlight({
    title: "File Converter Tool",
    social: {
      github: "https://github.com/rzmk/fct"
    }
  }), tailwind()]
});