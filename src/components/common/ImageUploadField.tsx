import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  RefreshCw,
  CloudUpload,
  Link,
  ShieldCheck,
  Info,
} from 'lucide-react';
import {
  uploadImageToCloudinary,
  validateImageFile,
  createLocalImagePreview,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from '../../services/cloudinaryService';

interface ImageUploadFieldProps {
  label?: string;
  folder?: string;
  currentImageUrl?: string;
  currentPublicId?: string;
  onImageChange: (url: string, publicId?: string) => void;
  disabled?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label = 'Upload Image Asset (Cloudinary CDN)',
  folder = 'general',
  currentImageUrl = '',
  currentPublicId = '',
  onImageChange,
  disabled = false,
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl);
  const [publicId, setPublicId] = useState<string>(currentPublicId);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(!!currentImageUrl);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [fallbackMessage, setFallbackMessage] = useState<string>('');
  const [customUrlInput, setCustomUrlInput] = useState<string>(currentImageUrl);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(currentImageUrl);
    setCustomUrlInput(currentImageUrl);
    if (currentImageUrl) {
      setUploadSuccess(true);
    }
  }, [currentImageUrl]);

  useEffect(() => {
    if (currentPublicId) {
      setPublicId(currentPublicId);
    }
  }, [currentPublicId]);

  const handleFileProcess = async (file: File) => {
    setUploadError(null);
    setUploadSuccess(false);
    setIsFallback(false);
    setFallbackMessage('');

    // Validate type and size (JPG, JPEG, PNG, WebP up to 5 MB)
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid image file.');
      return;
    }

    setSelectedFile(file);

    try {
      // Instant local preview
      const localDataUrl = await createLocalImagePreview(file);
      setPreviewUrl(localDataUrl);

      // Perform Cloudinary unsigned upload
      setIsUploading(true);
      setUploadProgress(0);

      const result = await uploadImageToCloudinary(file, folder, (percent) => {
        setUploadProgress(percent);
      });

      setPreviewUrl(result.secure_url);
      setPublicId(result.public_id);
      setUploadSuccess(true);
      setUploadError(null);

      if (result.isFallback) {
        setIsFallback(true);
        setFallbackMessage(result.fallbackMessage || '');
      }

      onImageChange(result.secure_url, result.public_id);
    } catch (err: any) {
      // Safe non-crashing handling
      setUploadError(err?.message || 'Could not process image. Please try again.');
      setUploadSuccess(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleRetry = () => {
    if (selectedFile) {
      handleFileProcess(selectedFile);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    setPublicId('');
    setSelectedFile(null);
    setUploadSuccess(false);
    setIsFallback(false);
    setFallbackMessage('');
    setUploadError(null);
    setCustomUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageChange('', '');
  };

  const handleApplyCustomUrl = () => {
    const url = customUrlInput.trim();
    if (!url) {
      handleRemoveImage();
      return;
    }
    setPreviewUrl(url);
    setPublicId('');
    setUploadSuccess(true);
    setIsFallback(false);
    setUploadError(null);
    onImageChange(url, '');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-zinc-300 flex items-center gap-1.5">
          <CloudUpload className="w-3.5 h-3.5 text-red-500" />
          <span>{label}</span>
        </label>
        <div className="flex items-center gap-1 bg-[#0A0D14] p-0.5 rounded border border-zinc-800 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded transition-colors ${
              mode === 'upload'
                ? 'bg-red-600 text-white font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            File Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded transition-colors ${
              mode === 'url'
                ? 'bg-red-600 text-white font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Direct Link
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div className="space-y-2">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            className="hidden"
          />

          {!previewUrl ? (
            /* Dropzone / Upload Area */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-red-500 bg-red-950/20 scale-[0.99]'
                  : 'border-zinc-800 hover:border-zinc-700 bg-[#07090D]'
              } ${disabled || isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-[#121520] border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-red-400 group-hover:border-red-500/40 transition-colors">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6 text-zinc-400" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-zinc-200">
                    <span className="text-red-400 underline underline-offset-2">Click to select photo</span> or drag & drop
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    JPG, JPEG, PNG, or WebP &middot; Max 5 MB
                  </p>
                </div>

                <div className="pt-1 flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono">
                  <span>Cloud: {CLOUDINARY_CLOUD_NAME}</span>
                  <span>&middot;</span>
                  <span>Preset: {CLOUDINARY_UPLOAD_PRESET}</span>
                  <span>&middot;</span>
                  <span className="text-emerald-500">Unsigned</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative bg-[#07090D] border border-zinc-800 rounded-xl p-3 flex items-center gap-4">
              {/* Thumbnail */}
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-black/60 border border-zinc-700 shrink-0 flex items-center justify-center relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                  </div>
                )}
              </div>

              {/* Details & Progress */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  {uploadSuccess && !isFallback && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Cloudinary Verified</span>
                    </span>
                  )}
                  {uploadSuccess && isFallback && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60" title="Image captured & ready to save to Firestore!">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Image Ready (Optimized)</span>
                    </span>
                  )}
                  {isUploading && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-red-400 font-bold bg-red-950/60 px-2 py-0.5 rounded border border-red-800/60 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Uploading ({uploadProgress}%)...</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-300 font-mono truncate">
                  {selectedFile ? selectedFile.name : (publicId || previewUrl.slice(0, 45) + '...')}
                </p>

                {publicId && (
                  <p className="text-[10px] text-zinc-500 font-mono truncate">
                    ID: <span className="text-zinc-400">{publicId}</span>
                  </p>
                )}

                {selectedFile && (
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Size: {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                )}

                {/* Progress bar */}
                {isUploading && (
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-red-600 transition-all duration-150 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || disabled}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded transition-colors"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isUploading || disabled}
                  className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Fallback Notice */}
          {isFallback && (
            <div className="p-2.5 bg-amber-950/40 border border-amber-800/60 rounded-lg text-xs space-y-1 text-amber-300/90">
              <div className="flex items-start gap-1.5">
                <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  Image is processed and ready to be saved to Firestore! To enable CDN delivery on Cloudinary, ensure the preset <code className="bg-black/40 px-1 py-0.5 rounded text-amber-200">{CLOUDINARY_UPLOAD_PRESET}</code> in your Cloudinary Console (Settings &gt; Upload) has its Signing Mode set to <strong>Unsigned</strong>.
                </span>
              </div>
            </div>
          )}

          {/* Upload Error display with Retry */}
          {uploadError && (
            <div className="p-3 bg-red-950/70 border border-red-800 rounded-lg text-xs space-y-2">
              <div className="flex items-start gap-2 text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span className="leading-relaxed">
                  <strong>Notice:</strong> {uploadError}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-red-900/60">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] rounded transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded transition-colors"
                >
                  Select Another File
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="url"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://res.cloudinary.com/fltlrs3/... or external image URL"
                className="w-full bg-[#07090D] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-red-500"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyCustomUrl}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              <Link className="w-3.5 h-3.5" />
              <span>Apply URL</span>
            </button>
          </div>

          {previewUrl && (
            <div className="bg-[#07090D] border border-zinc-800 rounded-lg p-2 flex items-center gap-3">
              <img
                src={previewUrl}
                alt="URL Preview"
                className="w-12 h-12 object-cover rounded bg-black"
              />
              <span className="text-xs text-zinc-300 font-mono truncate flex-1">
                {previewUrl}
              </span>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-1 text-zinc-400 hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
