import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireRole } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Max file sizes
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
];
const ALLOWED_VIDEO_TYPES = [
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo',
];

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
    'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg',
    'video/mp4': 'mp4', 'video/webm': 'webm', 'video/ogg': 'ogg',
    'video/quicktime': 'mov', 'video/x-msvideo': 'avi',
  };
  return map[mimeType] || 'bin';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['advertiser', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const mimeType = file.type;
    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType);

    if (!isImage && !isVideo) {
      return NextResponse.json({
        error: `Unsupported file type: ${mimeType}. Allowed: JPG, PNG, GIF, WEBP, MP4, WEBM`,
      }, { status: 400 });
    }

    // Check file size
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      const maxMB = maxSize / (1024 * 1024);
      return NextResponse.json({
        error: `File too large. Max size: ${maxMB}MB for ${isImage ? 'images' : 'videos'}`,
      }, { status: 400 });
    }

    // Generate unique filename
    const ext = getExtension(mimeType);
    const fileType = isImage ? 'images' : 'videos';
    const uniqueName = `${uuidv4()}.${ext}`;
    
    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', fileType);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(uploadDir, uniqueName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Build the public URL
    const fileUrl = `/uploads/${fileType}/${uniqueName}`;

    return NextResponse.json({
      success: true,
      file: {
        url: fileUrl,
        name: file.name,
        size: file.size,
        type: mimeType,
        category: isImage ? 'image' : 'video',
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}

// Increase body size limit for this route
export const runtime = 'nodejs'
