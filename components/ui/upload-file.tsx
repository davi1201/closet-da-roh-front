'use client';

import React from 'react';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { ActionIcon, Box, Button, Grid, Image, Text, Tooltip } from '@mantine/core';

export interface ImageObject {
  id: string | number;
  file?: File; // para arquivos locais
  previewUrl: string; // obrigatório, seja remoto ou local
  isRemote?: boolean; // true se veio do servidor
}

export interface ImageUploaderProps {
  images: ImageObject[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isLimitReached: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (id: string | number) => void;
  maxLimit: number;
}

const ImageUploaderMantine = ({
  images,
  fileInputRef,
  isLimitReached,
  handleFileChange,
  handleRemoveImage,
  maxLimit,
}: ImageUploaderProps) => {
  return (
    <Box>
      <input
        type="file"
        multiple
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={isLimitReached}
      />

      {images.length > 0 && (
        <Grid mb="md" gutter="sm">
          {images.map((image) => (
            <Grid.Col key={image.id} span={{ base: 6, xs: 4, sm: 3, md: 2, lg: 2 }}>
              <Box
                style={{
                  position: 'relative',
                  aspectRatio: '1/1',
                  borderRadius: 'var(--mantine-radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--mantine-color-gray-3)',
                }}
              >
                <Image
                  src={image.previewUrl}
                  alt={image.file?.name || `Imagem ${image.id}`}
                  fit="cover"
                  style={{ width: '100%', height: '100%' }}
                />

                <Tooltip label="Remover Imagem" withArrow position="top-end">
                  <ActionIcon
                    variant="filled"
                    color="red"
                    size="sm"
                    radius="xl"
                    onClick={() => handleRemoveImage(image.id)}
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      zIndex: 1,
                    }}
                    aria-label="Remover imagem"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Box>
            </Grid.Col>
          ))}
        </Grid>
      )}

      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLimitReached}
        leftSection={<IconUpload size={18} />}
        variant="light"
        color={isLimitReached ? 'gray' : 'indigo'}
        fullWidth
        style={{
          border: isLimitReached
            ? '2px dashed var(--mantine-color-gray-4)'
            : '2px dashed var(--mantine-color-indigo-4)',
          height: '150px',
        }}
      >
        <Text size="sm">
          {isLimitReached
            ? `Limite de ${maxLimit} imagens atingido`
            : `Selecionar Imagens (${images.length}/${maxLimit})`}
        </Text>
      </Button>
    </Box>
  );
};

export default ImageUploaderMantine;
