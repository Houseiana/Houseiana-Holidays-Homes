import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `profile-${timestamp}.${extension}`;

    // Save to public/uploads directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles');
    const filepath = join(uploadDir, filename);

    // Ensure directory exists
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Write file
    await writeFile(filepath, buffer);

    // Return the public URL
    const photoUrl = `/uploads/profiles/${filename}`;

    return NextResponse.json({
      success: true,
      photoUrl,
      message: 'Profile photo uploaded successfully'
    });

  } catch (error) {
    console.error('Profile photo upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload profile photo' },
      { status: 500 }
    );
  }
}