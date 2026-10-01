// app/api/upload-video/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("video") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No video provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
    const fileName = `video_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "videos");
      await fs.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, fileName);
      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/videos/${fileName}`;
      return NextResponse.json({
        success: 1,
        url: publicUrl,
      });
    } catch (fsErr: any) {
      console.warn("Read-only filesystem detected for video upload:", fsErr?.message);
      const mimeType = file.type || `video/${ext}`;
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64}`;
      return NextResponse.json({
        success: 1,
        url: dataUrl,
      });
    }
  } catch (err: any) {
    console.error("Video upload error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
