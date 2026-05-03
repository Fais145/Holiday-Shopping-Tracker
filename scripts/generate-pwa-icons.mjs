import sharp from "sharp"
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, "..", "public")

function svgForSize(size) {
  const r = Math.round(size * 0.33)
  const fs = Math.round(size * 0.26)
  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f7f5f0"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="#d97756"/>
  <text x="50%" y="${size / 2 + fs * 0.35}" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="${fs}" fill="#fdf8f5">YV</text>
</svg>`.trim()
}

async function main() {
  for (const size of [192, 512]) {
    const buf = await sharp(Buffer.from(svgForSize(size)))
      .resize(size, size)
      .png()
      .toBuffer()
    const out = join(publicDir, `icon-${size}.png`)
    writeFileSync(out, buf)
    console.log("wrote", out)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
