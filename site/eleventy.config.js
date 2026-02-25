import fs from "fs";
import path from "path";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";

export default function (eleventyConfig) {
  // --- Plugins ---
  eleventyConfig.addPlugin(syntaxHighlight);

  // --- Image optimization ---
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: "html",
    formats: ["webp", "jpeg"],
    widths: [200, 400, 800, 1200],
    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
    },
    filenameFormat: (id, src, width, format) => {
      const name = path.basename(src, path.extname(src));
      return `${name}-${width}w.${format}`;
    },
  });

  // --- Passthrough copies ---
  eleventyConfig.addPassthroughCopy("media");
  eleventyConfig.addPassthroughCopy({ "public": "/" });
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");

  // --- Collection factory ---
  // Reads content types from src/_data/contentTypes.json and generates
  // collections automatically. To add a new CPT: add its folder, directory
  // .json, layout, and an entry here.
  const typesPath = "src/_data/contentTypes.json";
  if (fs.existsSync(typesPath)) {
    const types = JSON.parse(fs.readFileSync(typesPath, "utf-8"));
    for (const [name, config] of Object.entries(types)) {
      eleventyConfig.addCollection(name, (collection) => {
        const items = collection
          .getFilteredByGlob(config.glob)
          .filter((item) => item.data.published !== false);

        if (config.sort === "date") {
          return items.sort((a, b) => b.date - a.date);
        }
        return items.sort(
          (a, b) => (a.data.order || 999) - (b.data.order || 999)
        );
      });
    }
  }

  // --- Filters ---
  eleventyConfig.addFilter("limit", (arr, limit) => arr.slice(0, limit));

  eleventyConfig.addFilter("where", (arr, key, val) =>
    arr.filter((i) => i.data[key] === val)
  );

  eleventyConfig.addFilter("dateISO", (date) => {
    if (!date) return "";
    const d = date === "now" ? new Date() : new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  });

  eleventyConfig.addFilter("year", () => new Date().getFullYear());

  eleventyConfig.addFilter("split", (str, sep) =>
    str ? str.split(sep) : []
  );

  eleventyConfig.addFilter("capitalize", (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : ""
  );

  eleventyConfig.addFilter("dateFormat", (date) => {
    if (!date) return "";
    const d = date === "now" ? new Date() : new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  eleventyConfig.addFilter("readingTime", (content) => {
    if (!content) return "";
    const text = content.replace(/<[^>]*>/g, "");
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} min read`;
  });

  eleventyConfig.addFilter("excerpt", (content) => {
    if (!content) return "";
    const text = content.replace(/<[^>]*>/g, "").trim();
    const firstPara = text.split(/\n\n/)[0];
    return firstPara.length > 200
      ? firstPara.slice(0, 197) + "..."
      : firstPara;
  });

  eleventyConfig.addFilter("absoluteUrl", (url, base) => {
    if (!url || !base) return url || "";
    const baseUrl = base.replace(/\/$/, "");
    return url.startsWith("/") ? baseUrl + url : url;
  });

  // --- Build-time validation ---
  eleventyConfig.on("eleventy.before", () => {
    const requiredFields = ["title", "slug"];
    const contentDir = "content";

    // Auto-discover content directories to validate
    let dirs = [];
    try {
      dirs = fs.readdirSync(contentDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name !== "pages")
        .map((d) => d.name);
    } catch { /* ok */ }

    for (const dir of dirs) {
      const folder = `${contentDir}/${dir}`;
      if (!fs.existsSync(folder)) continue;
      const files = fs.readdirSync(folder).filter((f) => f.endsWith(".md"));
      for (const file of files) {
        const raw = fs.readFileSync(`${folder}/${file}`, "utf-8");
        const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
        if (!fmMatch) continue;
        for (const field of requiredFields) {
          const re = new RegExp(`^${field}\\s*:`, "m");
          if (!re.test(fmMatch[1])) {
            console.warn(
              `⚠ [Ink] Missing "${field}" in ${folder}/${file}`
            );
          }
        }
      }
    }
  });

  // --- Directory configuration ---
  return {
    dir: {
      input: ".",
      includes: "src/_includes",
      layouts: "src/_layouts",
      data: "src/_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"],
  };
}
