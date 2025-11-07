// src/hooks/useModelGenerator.ts

import { useState } from 'react';
import { GenerateImageParams, generateModelImage } from '../services/gemini-image';

export const useModelGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  /**
   * Função para lidar com a submissão do formulário.
   */
  const generateImage = async (params: GenerateImageParams) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateModelImage(params);
      setResult(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(`❌ ${err.message}`);
      } else {
        setError('❌ Ocorreu um erro inesperado');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    result,
    generateImage,
  };
};
