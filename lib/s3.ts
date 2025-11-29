import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload a file to S3
 * @param file - File buffer or Blob
 * @param folder - S3 folder path (e.g., 'properties/123')
 * @param fileName - Name of the file
 * @returns Promise with upload result containing URL and S3 key
 */
export async function uploadToS3(
  file: Buffer | Uint8Array,
  folder: string,
  fileName: string
): Promise<UploadResult> {
  const bucket = process.env.AWS_S3_BUCKET || 'houseiana-property-photos';
  const key = `${folder}/${fileName}`;

  console.log('🔧 S3 Upload details:', {
    bucket,
    key,
    fileSize: file.length,
    contentType: getContentType(fileName),
  });

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: getContentType(fileName),
    });

    console.log('⏳ Sending to S3...');
    await s3Client.send(command);
    console.log('✅ S3 upload complete');

    const url = `https://${bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    return { url, key };
  } catch (error: any) {
    console.error('❌ S3 Upload error:', {
      name: error?.name,
      message: error?.message,
      code: error?.Code || error?.code,
      statusCode: error?.$metadata?.httpStatusCode,
      requestId: error?.$metadata?.requestId,
    });
    throw error;
  }
}

/**
 * Delete a file from S3
 * @param key - S3 object key
 * @returns Promise
 */
export async function deleteFromS3(key: string): Promise<void> {
  const bucket = process.env.AWS_S3_BUCKET || 'houseiana-property-photos';

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Get content type from file name
 * @param fileName - Name of the file
 * @returns Content type string
 */
function getContentType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();

  const contentTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
  };

  return contentTypes[ext || ''] || 'application/octet-stream';
}
