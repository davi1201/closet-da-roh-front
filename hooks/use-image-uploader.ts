'use client';

import { useCallback, useRef, useState } from 'react';

const MAX_IMAGES: number = 5;

export interface ImageObject {
  id: number | string;
  file?: File; // Opcional, só para imagens locais
  previewUrl: string; // Pode ser URL remota ou local
  isRemote?: boolean; // True se for uma imagem vinda do servidor (AWS)
}

export interface ImageUploaderHook {
  images: ImageObject[];
  files: File[]; // Apenas arquivos locais
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  maxLimit: number;
  isLimitReached: boolean;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (id: number | string) => void;
  reset: () => void;
  setInitialImages: (images: ImageObject[]) => void;
}

const useImageUploader = (maxLimit: number = MAX_IMAGES): ImageUploaderHook => {
  const [images, setImages] = useState<ImageObject[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Somente arquivos locais (não remotos)
  const files: File[] = images
    .filter((img) => !img.isRemote && img.file)
    .map((img) => img.file!) as File[];
  const isLimitReached: boolean = images.length >= maxLimit;

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files;
      if (!selectedFiles) return;

      const newFiles = Array.from(selectedFiles);

      const validImages: File[] = newFiles
        .filter((file) => file.type.startsWith('image/'))
        .slice(0, maxLimit - images.length);

      if (validImages.length === 0) return;

      const newImageObjects: ImageObject[] = validImages.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        id: Date.now() + Math.random(),
        isRemote: false,
      }));

      setImages((prev) => [...prev, ...newImageObjects]);

      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [images, maxLimit]
  );

  const handleRemoveImage = useCallback(
    (id: number | string) => {
      const imageToRemove = images.find((img) => img.id === id);

      // Remove object URL apenas se for local
      if (imageToRemove && !imageToRemove.isRemote) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }

      setImages((prev) => prev.filter((img) => img.id !== id));
    },
    [images]
  );

  const reset = () => setImages([]);

  const setInitialImages = (initialImages: ImageObject[]) => {
    // Marcar todas as imagens iniciais como remotas
    const remoteImages = initialImages.map((img) => ({ ...img, isRemote: true }));
    setImages(remoteImages);
  };

  return {
    images,
    files,
    fileInputRef,
    reset,
    maxLimit,
    isLimitReached,
    handleFileChange,
    handleRemoveImage,
    setInitialImages,
  };
};

export default useImageUploader;
