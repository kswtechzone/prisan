import { NextResponse } from "next/server"
import { writeFile, mkdir, access } from "fs/promises"
import path from "path"
import sharp from "sharp"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]
const MAX_WIDTH = 1200
const JPEG_QUALITY = 70

async function getBaseDir(): Promise<string> {
  // 1. Explicit env var wins
  if (process.env.UPLOAD_DIR) return process.env.UPLOAD_DIR

  const cwd = process.cwd()

  // 2. In dev, cwd is project root — public/ exists
  const publicDir = path.join(cwd, "public")
  try {
    await access(publicDir)
    return publicDir
  } catch {
    // 3. In standalone output, cwd is .next/standalone — check parent
    const parentPublic = path.join(cwd, "..", "public")
    try {
      await access(parentPublic)
      return parentPublic
    } catch {
      // 4. Fallback: create public/ alongside server
      return publicDir
    }
  }
}

function saveFile(raw: Buffer, subDir: string) {
  return new Promise<{ url: string; filename: string }>(async (resolve, reject) => {
    try {
      const image = sharp(raw)
      const metadata = await image.metadata()
      let output: Buffer

      if (metadata.width && metadata.width > MAX_WIDTH) {
        output = await image.resize({ width: MAX_WIDTH, withoutEnlargement: true }).jpeg({ quality: JPEG_QUALITY }).toBuffer()
      } else {
        output = await image.jpeg({ quality: JPEG_QUALITY }).toBuffer()
      }

      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
      const baseDir = await getBaseDir()
      const uploadDir = path.join(baseDir, "uploads", subDir)
      const filepath = path.join(uploadDir, filename)

      await mkdir(uploadDir, { recursive: true })
      await writeFile(filepath, output)

      resolve({ url: `/uploads/${subDir}/${filename}`, filename })
    } catch (e) {
      reject(e)
    }
  })
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const subDir = (formData.get("dir") as string) || "services"

    const files: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key === "file" && value instanceof File) files.push(value)
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `Invalid file type: ${file.type}` }, { status: 400 })
      }
    }

    const results = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer()
        const raw = Buffer.from(bytes)
        return saveFile(raw, subDir)
      })
    )

    return NextResponse.json({ urls: results.map((r) => r.url) })
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
