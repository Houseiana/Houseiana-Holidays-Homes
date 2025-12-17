import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize S3 client for backup
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET || 'houseiana-property-photos';

/**
 * Backup image to S3 from Cloudinary URL
 */
async function backupToS3(imageUrl: string, folder: string, filename: string): Promise<string | null> {
  try {
    // Check if S3 credentials are configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.warn('⚠️ S3 backup skipped: AWS credentials not configured');
      return null;
    }

    // Fetch image from Cloudinary
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch image from Cloudinary');
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Upload to S3
    const key = `backup/${folder}/${filename}`;
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: {
        'cloudinary-url': imageUrl,
        'backup-date': new Date().toISOString(),
      },
    });

    await s3Client.send(command);

    const s3Url = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    console.log(`✅ S3 backup created: ${s3Url}`);

    return s3Url;
  } catch (error) {
    console.error('❌ S3 backup failed:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Cloudinary credentials are configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary credentials not configured');
      return NextResponse.json(
        { success: false, error: 'Image service not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'properties';

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

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Convert file to base64 for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Generate unique public_id
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const publicId = `${folder}/${timestamp}-${randomId}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: folder,
      public_id: `${timestamp}-${randomId}`,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:best' },
        { fetch_format: 'auto' },
      ],
    });

    console.log(`✅ Photo uploaded to Cloudinary: ${uploadResult.secure_url}`);

    // Backup to S3 (async, don't wait for it to complete)
    const filename = `${timestamp}-${randomId}.${uploadResult.format || 'jpg'}`;
    backupToS3(uploadResult.secure_url, folder, filename).then((s3Url) => {
      if (s3Url) {
        console.log(`📦 Backup completed: ${s3Url}`);
      }
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      message: 'Photo uploaded successfully',
    });

  } catch (error: any) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove image from Cloudinary (and optionally S3 backup)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID required' },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      console.log(`🗑️ Photo deleted from Cloudinary: ${publicId}`);
      return NextResponse.json({
        success: true,
        message: 'Photo deleted successfully',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete photo' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Photo delete error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete photo' },
      { status: 500 }
    );
  }
}
