import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = (formData.get('type') as string) || "banner";
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'لا يوجد ملف مرفوع' }, { status: 400 });
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'banners');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'png';
    const filename = `${type}-banner-${timestamp}.${ext}`;
    const filepath = join(uploadsDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    return NextResponse.json({ 
      success: true, 
      filename: `/uploads/banners/${filename}`,
      url: `/uploads/banners/${filename}`,
      message: 'تم رفع الصورة بنجاح'
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'فشل في رفع الصورة' 
    }, { status: 500 });
  }
}

export async function GET(_request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    image: null 
  });
}
