import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3 } from '../../../lib/s3';

export async function POST(request: NextRequest) {
  try {
    console.log('📸 Upload photo request received');

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'properties';

    console.log('📝 File details:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      folder,
    });

    if (!file) {
      console.error('❌ No file provided in request');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    console.log('🔄 Converting file to buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('✅ Buffer created, size:', buffer.length);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${extension}`;

    console.log('📦 Generated filename:', fileName);
    console.log('🚀 Attempting S3 upload to bucket:', process.env.AWS_S3_BUCKET);
    console.log('🌍 AWS Region:', process.env.AWS_REGION);
    console.log('🔑 AWS Credentials check:', {
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      accessKeyPrefix: process.env.AWS_ACCESS_KEY_ID?.substring(0, 4),
    });

    // Upload to S3
    const result = await uploadToS3(buffer, folder, fileName);

    console.log('✅ Upload successful:', result.url);

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
    });
  } catch (error: any) {
    console.error('❌ Error uploading file:', error);
    console.error('❌ Error name:', error?.name);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error code:', error?.Code || error?.code);
    console.error('❌ Error stack:', error?.stack);

    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: error?.message || 'Unknown error',
        errorCode: error?.Code || error?.code,
      },
      { status: 500 }
    );
  }
}
