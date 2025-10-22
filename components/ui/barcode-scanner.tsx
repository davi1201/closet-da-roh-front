'use client';

import React, { useRef, useState } from 'react';
import { IconBarcode } from '@tabler/icons-react';
import { BarcodeFormat, BrowserMultiFormatReader, DecodeHintType } from '@zxing/library';
import { Button, Loader, Stack, Text } from '@mantine/core';

interface BarcodeScannerIOSFallbackProps {
  onChange: (code: string) => void;
}

export default function BarcodeScannerIOSFallback({ onChange }: BarcodeScannerIOSFallbackProps) {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        if (!imageUrl) {
          throw new Error('Não foi possível ler a imagem.');
        }

        // Configurar o leitor ZXing
        const hints = new Map();
        const formats = [
          BarcodeFormat.CODE_128,
          BarcodeFormat.EAN_13,
          BarcodeFormat.QR_CODE /* Adicione outros formatos se precisar */,
        ];
        hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
        const codeReader = new BrowserMultiFormatReader(hints);

        try {
          // Decodificar a imagem (pode precisar de um <img> element temporário ou usar direto do Data URL)
          const result = await codeReader.decodeFromImageUrl(imageUrl);
          onChange && onChange(result.getText());
        } catch (decodeError: any) {
          console.error('Erro ao decodificar:', decodeError);
          // Trata erros comuns do ZXing
          if (decodeError.name === 'NotFoundException') {
            setError('Nenhum código de barras encontrado na imagem.');
          } else if (decodeError.name === 'ChecksumException') {
            setError('Código de barras inválido (erro de checksum).');
          } else {
            setError('Não foi possível ler o código de barras.');
          }
        } finally {
          setIsLoading(false);
          // Limpa o input para permitir tirar outra foto igual em seguida
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        setError('Erro ao carregar a imagem.');
        setIsLoading(false);
      };
      reader.readAsDataURL(file); // Lê o arquivo como Data URL
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Stack>
      <Button onClick={triggerFileInput} disabled={isLoading}>
        <IconBarcode size={18} />
        {isLoading ? <Loader size="xs" /> : 'Escanear Código (Abrir Câmera)'}
      </Button>

      {/* Input escondido */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment" // Pede a câmera traseira
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}
    </Stack>
  );
}
