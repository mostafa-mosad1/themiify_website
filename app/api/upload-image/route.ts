// app/api/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = (formData.get("image") || formData.get("file")) as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try local filesystem write (works in local dev / dedicated hosting)
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "images");
      await fs.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, fileName);
      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/images/${fileName}`;
      return NextResponse.json({
        success: 1,
        url: publicUrl,
        file: {
          url: publicUrl,
        },
      });
    } catch (fsErr: any) {
      // In serverless read-only environments (e.g. Vercel), fall back to Data URL safely
      console.warn("Read-only filesystem detected on serverless platform:", fsErr?.message);
      const mimeType = file.type || `image/${ext}`;
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64}`;

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
