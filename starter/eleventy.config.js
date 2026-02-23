import fs from "fs";

export default function (eleventyConfig) {
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

  // --- Build-time validation ---
  eleventyConfig.on("eleventy.before", () => {
    const requiredFields = ["title", "slug"];
    const contentDir = "content";
    const dirs = ["services", "employees"];

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
