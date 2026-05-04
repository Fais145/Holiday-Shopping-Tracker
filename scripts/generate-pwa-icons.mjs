/**
 * Builds PWA + favicon assets from `public/logo-source.png`.
 * Run: npm run icons
 */
import { existsSync } from "fs"
import sharp from "sharp"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const publicDir = join(root, "public")
const appDir = join(root, "src", "app")
const source = join(publicDir, "logo-source.png")

async function main() {
  if (!existsSync(source)) {
    console.error("Missing public/logo-source.png — add your square logo PNG first.")
    process.exit(1)
  }

  for (const size of [192, 512]) {
    const out = join(publicDir, `icon-${size}.png`)
    await sharp(source)
      .resize(size, size, { fit: "cover", position: "centre" })
      .png()
      .toFile(out)
    console.log("wrote", out)
  }

  const appIcon = join(appDir, "icon.png")
  await sharp(source)
    .resize(512, 512, { fit: "cover", position: "centre" })
    .png()
    .toFile(appIcon)
  console.log("wrote", appIcon)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
