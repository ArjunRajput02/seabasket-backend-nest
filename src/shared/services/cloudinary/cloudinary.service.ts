import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export type UploadImageParams = {
  buffer: Buffer;
  folder?: string;
};

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  // configure cloudinary with credentials from environment variables
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  // Uploads an image to Cloudinary and returns the secure URL of the uploaded image.
  async uploadImage(uploadImageParams: UploadImageParams): Promise<string | null> {
    const { buffer, folder } = uploadImageParams;

    try {
      // Upload the image to Cloudinary using a stream
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        // Use Cloudinary's upload_stream method to handle the upload
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder },
          (error, uploadResult) => {
            if (error || !uploadResult) {
              reject(
                error instanceof Error
                  ? error
                  : new Error(error?.message ?? 'Cloudinary upload returned no result'),
              );
              return;
            }

            // Resolve the promise with the upload result
            resolve(uploadResult);
          },
        );

        // Write the buffer to the upload stream and end the stream
        uploadStream.end(buffer);
      });

      return result.secure_url;
    } catch (error) {
      this.logger.error('Failed to upload image to Cloudinary', {
        folder,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }
}
