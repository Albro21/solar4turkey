import fs from 'fs';
import path from 'path';
import cssnano from 'cssnano';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import { EleventyI18nPlugin } from '@11ty/eleventy';

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets/img": "assets/img" });
  eleventyConfig.addPassthroughCopy({ "src/assets/favicons": "assets/favicons" });

  // 1. Register Plugins
  eleventyConfig.addPlugin(EleventyI18nPlugin, {
    defaultLanguage: 'en',
  });

  // 2. Setup PostCSS Processor
  const processor = postcss([
    tailwindcss(),
    cssnano({ preset: 'default' }),
  ]);

  // 3. Compile Tailwind CSS before Eleventy builds pages
  eleventyConfig.on('eleventy.before', async () => {
    const tailwindInputPath = path.resolve('./src/assets/scss/tailwind.css');
    const tailwindOutputPath = './dist/assets/css/tailwind.css';

    const cssContent = fs.readFileSync(tailwindInputPath, 'utf8');

    const outputDir = path.dirname(tailwindOutputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const result = await processor.process(cssContent, {
      from: tailwindInputPath,
      to: tailwindOutputPath,
    });

    fs.writeFileSync(tailwindOutputPath, result.css);
  });

  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
  };
}
