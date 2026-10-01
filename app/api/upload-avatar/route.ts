// app/api/upload-avatar/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `avatar_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
      await fs.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, fileName);
      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/avatars/${fileName}`;
      return NextResponse.json({ url: publicUrl });
    } catch (fsErr: any) {
      console.warn("Read-only filesystem detected for avatar upload:", fsErr?.message);
      const mimeType = file.type || `image/${ext}`;
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64}`;
      return NextResponse.json({ url: dataUrl });
    }
  } catch (err: any) {
    console.error("Avatar upload error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
