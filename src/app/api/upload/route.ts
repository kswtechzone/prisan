import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import sharp from "sharp"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]
const MAX_WIDTH = 1200
const JPEG_QUALITY = 70

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const raw = Buffer.from(bytes)

    const image = sharp(raw)
    const metadata = await image.metadata()
    let output: Buffer

    if (metadata.width && metadata.width > MAX_WIDTH) {
      output = await image.resize({ width: MAX_WIDTH, withoutEnlargement: true }).jpeg({ quality: JPEG_QUALITY }).toBuffer()
    } else {
      output = await image.jpeg({ quality: JPEG_QUALITY }).toBuffer()
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
    const baseDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "public")
    const uploadDir = path.join(baseDir, "uploads", "services")
    const filepath = path.join(uploadDir, filename)

    await mkdir(uploadDir, { recursive: true })
    await writeFile(filepath, output)

    return NextResponse.json({ url: `/uploads/services/${filename}` })
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
