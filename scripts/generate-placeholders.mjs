/**
 * Generate minimal gray placeholder PNG images for Ink starters.
 * Uses raw PNG encoding — no external dependencies.
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { deflateSync } from "zlib";

function createPNG(width, height, r = 200, g = 200, b = 200) {
  // Build raw image data (each row: filter byte + RGB pixels)
  const rawRows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 3); // filter byte + RGB
    row[0] = 0; // no filter
    for (let x = 0; x < width; x++) {
      const offset = 1 + x * 3;
      row[offset] = r;
      row[offset + 1] = g;
      row[offset + 2] = b;
    }
    rawRows.push(row);
  }
  const rawData = Buffer.concat(rawRows);
  const compressed = deflateSync(rawData);

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk("IHDR", ihdrData);

  // IDAT chunk
  const idat = makeChunk("IDAT", compressed);

  // IEND chunk
  const iend = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);

  const typeBuffer = Buffer.from(type, "ascii");
  const crcInput = Buffer.concat([typeBuffer, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput));

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Placeholder definitions: [filename, width, height]
const placeholders = [
  // Services — landscape, hero-friendly
  ["service-placeholder-1.jpg", 1200, 800],
  ["service-placeholder-2.jpg", 1200, 800],

  // Employees — square, portrait-friendly
  ["employee-placeholder-1.jpg", 600, 600],
  ["employee-placeholder-2.jpg", 600, 600],

  // Site — logo-sized square
  ["site-placeholder.jpg", 800, 800],
];

// Output to both starters
const starters = ["starter", "starter-tailwind"];
const categories = {
  "service-placeholder": "services",
  "employee-placeholder": "employees",
  "site-placeholder": "site",
};

for (const starter of starters) {
  for (const [filename, width, height] of placeholders) {
    const category = Object.entries(categories).find(([prefix]) =>
      filename.startsWith(prefix)
    )?.[1];
    const dir = join(process.cwd(), starter, "media", category);
    mkdirSync(dir, { recursive: true });

    // Use slightly different grays for variety
    const shade = 190 + Math.floor(Math.random() * 20);
    const png = createPNG(width, height, shade, shade, shade);

    // Save as .jpg extension name but PNG content
    // Actually, save as .png since that's what it is
    const pngFilename = filename.replace(".jpg", ".png");
    writeFileSync(join(dir, pngFilename), png);
    console.log(`  ${starter}/media/${category}/${pngFilename} (${width}x${height})`);
  }
}

console.log("\nDone! Placeholder images generated.");
