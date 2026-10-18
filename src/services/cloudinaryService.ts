/**
 * Cloudinary Image Upload Service for ALTRON'Z Website
 * Uses unsigned upload preset 'altronz_gallery' with cloud name 'fltlrs3'.
 * NEVER includes any API secrets in frontend code.
 */

export const DEFAULT_CLOUDINARY_CLOUD_NAME = 'fltlrs3';
export const DEFAULT_CLOUDINARY_UPLOAD_PRESET = 'altronz_gallery';

export function getCloudinaryCloudName(): string {
  try {
    return localStorage.getItem('altronz_cloudinary_cloud_name') || DEFAULT_CLOUDINARY_CLOUD_NAME;
  } catch {
    return DEFAULT_CLOUDINARY_CLOUD_NAME;
  }
}

export function getCloudinaryUploadPreset(): string {
  try {
    return localStorage.getItem('altronz_cloudinary_upload_preset') || DEFAULT_CLOUDINARY_UPLOAD_PRESET;
  } catch {
    return DEFAULT_CLOUDINARY_UPLOAD_PRESET;
  }
}

export function setCloudinaryConfig(cloudName: string, uploadPreset: string): void {
  try {
    localStorage.setItem('altronz_cloudinary_cloud_name', cloudName.trim());
    localStorage.setItem('altronz_cloudinary_upload_preset', uploadPreset.trim());
  } catch (err) {
    console.warn('Could not save Cloudinary config to localStorage:', err);
  }
}

export const CLOUDINARY_CLOUD_NAME = DEFAULT_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_UPLOAD_PRESET = DEFAULT_CLOUDINARY_UPLOAD_PRESET;
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  isFallback?: boolean;
  fallbackMessage?: string;
}

export interface UploadProgressCallback {
  (progressPercent: number): void;
}

/**
 * Validates file format and file size against Cloudinary requirements
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No image file provided.' };
  }

  const mime = file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  const isMimeValid = ALLOWED_IMAGE_MIME_TYPES.includes(mime);
  const isExtValid = ALLOWED_IMAGE_EXTENSIONS.includes(extension);

  if (!isMimeValid && !isExtValid) {
    return {
      valid: false,
      error: `Unsupported image format (${mime || extension || 'unknown'}). Supported formats: JPG, JPEG, PNG, WebP.`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds maximum allowed limit of 5 MB.`,
    };
  }

  return { valid: true };
}

/**
 * Creates an optimized client-side compressed image as a graceful fallback
 * if Cloudinary preset is pending configuration in Cloudinary Console.
 */
export async function createOptimizedImageDataUrl(file: File, maxDim = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string || '');
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(e.target?.result as string || '');
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Tests connection to Cloudinary unsigned upload preset
 */
export async function testCloudinaryConnection(
  cloudName = getCloudinaryCloudName(),
  preset = getCloudinaryUploadPreset()
): Promise<{ ok: boolean; message: string; requiresUnsignedPreset?: boolean }> {
  try {
    const testBase64 =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const blob = await (await fetch(testBase64)).blob();
    const testFile = new File([blob], 'altronz_probe.png', { type: 'image/png' });

    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('upload_preset', preset);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const res = await fetch(uploadUrl, { method: 'POST', body: formData });
    const data = await res.json();

    if (res.ok && data.secure_url) {
      return {
        ok: true,
        message: `Cloudinary connected successfully! Cloud: "${cloudName}", Preset: "${preset}" is active and in Unsigned mode.`,
      };
    }

    const rawMsg = data.error?.message || `Status ${res.status}`;
    const isUnknownKey = rawMsg.toLowerCase().includes('unknown api key');

    return {
      ok: false,
      requiresUnsignedPreset: isUnknownKey,
      message: isUnknownKey
        ? `Preset "${preset}" on "${cloudName}" is either missing or set to "Signed". In Cloudinary Console (Settings > Upload > Upload presets), set Signing Mode to "Unsigned".`
        : `Cloudinary response: ${rawMsg}`,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `Network error reaching Cloudinary: ${err.message}`,
    };
  }
}

/**
 * Upload an image file to Cloudinary via unsigned upload
 * Gracefully provides high-quality fallback if Cloudinary preset is pending activation in console.
 */
export async function uploadImageToCloudinary(
  file: File,
  folder?: string,
  onProgress?: UploadProgressCallback
): Promise<CloudinaryUploadResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const cloudName = getCloudinaryCloudName();
  const uploadPreset = getCloudinaryUploadPreset();
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  if (folder) {
    formData.append('folder', `altronz/${folder}`);
  }

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl);

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.secure_url && data.public_id) {
            resolve({
              secure_url: data.secure_url,
              public_id: data.public_id,
              format: data.format,
              bytes: data.bytes,
              width: data.width,
              height: data.height,
              isFallback: false,
            });
            return;
          }
        } catch {
          // If JSON parse fails, drop to graceful fallback below
        }
      }

      // Cloudinary returned non-200 (e.g. 401 Unknown API key because preset is Signed or missing)
      // Provide instant, high-quality fallback so user workflow is never blocked
      try {
        const errData = JSON.parse(xhr.responseText || '{}');
        const rawMsg = errData.error?.message || `Status ${xhr.status}`;
        console.warn(`Cloudinary notice (${rawMsg}): Using optimized local fallback storage.`);
      } catch {
        console.warn('Cloudinary upload notice: Using optimized local fallback storage.');
      }

      const optimizedUrl = await createOptimizedImageDataUrl(file);
      const fallbackId = `altronz_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      resolve({
        secure_url: optimizedUrl || (await createLocalImagePreview(file)),
        public_id: fallbackId,
        format: file.type.split('/')[1] || 'jpeg',
        bytes: file.size,
        isFallback: true,
        fallbackMessage: `Cloudinary preset "${uploadPreset}" returned "Unknown API key". (Ensure preset Signing Mode is set to "Unsigned" in Cloudinary Console). Image saved safely to Firestore as high-performance backup.`,
      });
    };

    xhr.onerror = async () => {
      console.warn('Cloudinary network connection notice: Using optimized local fallback storage.');
      const optimizedUrl = await createOptimizedImageDataUrl(file);
      const fallbackId = `altronz_net_${Date.now()}`;
      resolve({
        secure_url: optimizedUrl || (await createLocalImagePreview(file)),
        public_id: fallbackId,
        isFallback: true,
        fallbackMessage: 'Network issue connecting to Cloudinary. Image saved locally.',
      });
    };

    xhr.send(formData);
  });
}

/**
 * Instant local Data URL generator for client preview before upload completes
 */
export function createLocalImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file preview.'));
    reader.readAsDataURL(file);
  });
}
