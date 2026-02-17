import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Image as ImageIcon, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { prepareImageForUpload } from '@/lib/imageUpload';

interface ImageUploaderProps {
  onUpload: (imageUrl: string) => void;
  currentImage?: string;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
}

export const ImageUploader = ({
  onUpload,
  currentImage,
  maxSize = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
}: ImageUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const prepared = await prepareImageForUpload(file, {
        askToCompress: true,
        maxDimension: 1920,
        targetMaxBytes: maxSize * 1024 * 1024
      });
      setPreview(prepared.dataUrl);
      setUploadedUrl(prepared.dataUrl);
      onUpload(prepared.dataUrl);
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [maxSize, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFormats.reduce((acc, format) => ({ ...acc, [format]: [] }), {}),
    maxSize: maxSize * 1024 * 1024,
    multiple: false
  });

  const handleRemove = () => {
    setPreview(null);
    setUploadedUrl(null);
    onUpload('');
  };

  return (
    <Card>
      <CardContent className="p-6">
        {preview ? (
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
              {uploadedUrl && (
                <Badge className="absolute bottom-2 right-2 bg-green-500">
                  <Check className="h-3 w-3 mr-1" />
                  Uploaded
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
            `}
          >
            <input {...getInputProps()} disabled={isUploading} />
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-primary font-medium">Drop the image here</p>
            ) : isUploading ? (
              <p className="text-muted-foreground">Uploading...</p>
            ) : (
              <>
                <p className="text-muted-foreground mb-2">
                  Drag & drop an image here, or click to select
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported: {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} 
                  {' '}(Max {maxSize}MB)
                </p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface MultiImageUploaderProps {
  onUpload: (imageUrls: string[]) => void;
  currentImages?: string[];
  maxImages?: number;
}

export const MultiImageUploader = ({
  onUpload,
  currentImages = [],
  maxImages = 5
}: MultiImageUploaderProps) => {
  const [images, setImages] = useState<string[]>(currentImages);

  const handleAddImage = (imageUrl: string) => {
    if (images.length < maxImages) {
      const newImages = [...images, imageUrl];
      setImages(newImages);
      onUpload(newImages);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onUpload(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, index) => (
          <div key={index} className="relative group">
            <img 
              src={img} 
              alt={`Upload ${index + 1}`} 
              className="w-full h-32 object-cover rounded-lg border"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemoveImage(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <div className="border-2 border-dashed rounded-lg p-4 flex items-center justify-center">
            <ImageUploader 
              onUpload={handleAddImage}
              maxSize={3}
            />
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        {images.length} / {maxImages} images uploaded
      </p>
    </div>
  );
};

