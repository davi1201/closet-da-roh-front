'use client';

import { useCallback, useRef, useState } from 'react';

const MAX_IMAGES: number = 5;

export interface ImageObject {
  id: number | string;
  file?: File;
  previewUrl: string;
  isRemote?: boolean;
  key?: string;
}

export interface ImageUploaderHook {
  images: ImageObject[];
  files: File[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  maxLimit: number;
  isLimitReached: boolean;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (id: number | string) => void;
  reset: () => void;
  setInitialImages: (images: ImageObject[]) => void;
}

// 1. Adicione props ao hook
interface UseImageUploaderProps {
  maxLimit?: number;
  /** Callback para sincronizar o estado com um formulário externo (ex: Mantine useForm) */
  onImagesChange?: (images: ImageObject[]) => void;
}

// 2. Atualize a assinatura do hook
const useImageUploader = ({
  maxLimit = MAX_IMAGES,
  onImagesChange,
}: UseImageUploaderProps): ImageUploaderHook => {
  // 3. Renomeie o setter interno do estado
  const [images, _setImages] = useState<ImageObject[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 4. Crie uma função 'setImages' encapsulada
  // Esta função atualiza o estado INTERNO e chama o callback EXTERNO
  const setImages = (value: React.SetStateAction<ImageObject[]>) => {
    _setImages((prev) => {
      // Resolve o novo estado
      const newImages = typeof value === 'function' ? value(prev) : value;

      // Chama o callback de sincronização (se existir)
      if (onImagesChange) {
        onImagesChange(newImages);
      }

      return newImages;
    });
  };

  // Esta lógica permanece a mesma, ela será re-calculada no render
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

      // 5. Use o setter encapsulado
      setImages((prev) => [...prev, ...newImageObjects]);

      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [images.length, maxLimit, onImagesChange] // 6. Adicione onImagesChange às dependências
  );

  const handleRemoveImage = useCallback(
    (id: number | string) => {
      const imageToRemove = images.find((img) => img.id === id);

      if (imageToRemove && !imageToRemove.isRemote) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }

      // 7. Use o setter encapsulado
      setImages((prev) => prev.filter((img) => img.id !== id));
    },
    [images, onImagesChange] // 8. Adicione onImagesChange às dependências
  );

  // 9. Use o setter encapsulado
  const reset = () => setImages([]);

  const setInitialImages = (initialImages: ImageObject[]) => {
    const remoteImages = initialImages.map((img) => ({
      ...img,
      isRemote: true,
    }));
    // 10. Use o setter encapsulado
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
