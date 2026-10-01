import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = (formData.get("image") || formData.get("file")) as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // Compress & resize image with sharp to WebP format with max width 1000px and 75% quality
    let optimizedBuffer: Buffer;
    try {
      optimizedBuffer = await sharp(rawBuffer)
        .resize({ width: 1000, withoutEnlargement: true, fit: "inside" })
        .webp({ quality: 75 })
        .toBuffer();
    } catch (sharpErr) {
      console.warn("Sharp compression failed, using original buffer:", sharpErr);
      optimizedBuffer = rawBuffer;
    }

    const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;

    // Try local filesystem write (works in local dev / dedicated hosting)
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "images");
      await fs.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, fileName);
      await fs.writeFile(filePath, optimizedBuffer);

      const publicUrl = `/uploads/images/${fileName}`;
      return NextResponse.json({
        success: 1,
        url: publicUrl,
        file: {
          url: publicUrl,
        },
      });
    } catch (fsErr: any) {
      // In serverless read-only environments (e.g. Vercel), fall back to compressed Data URL
      console.warn("Read-only filesystem detected on serverless platform:", fsErr?.message);
      const base64 = optimizedBuffer.toString("base64");
      const dataUrl = `data:image/webp;base64,${base64}`;

      return NextResponse.json({
        success: 1,
        url: dataUrl,
        file: {
          url: dataUrl,
        },
      });
    }
  } catch (err: any) {
    console.error("Upload image error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
