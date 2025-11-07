import api from '@/lib/api';

// ==================== INTERFACES ====================

export interface GenerateImageParams {
  file: File;
  clothingType: string;
  modelStyle: string;
  background?: string;
  dominantColor?: string | null;
  numberOfImages?: number;
  aspectRatio?: string;
}

export interface GenerateColorVariationsParams {
  file: File;
  clothingType: string;
  colors: string[];
  imagesPerColor?: number;
  modelStyle?: string;
  background?: string;
  aspectRatio?: string;
}

export interface GeneratedImage {
  imageBase64: string;
  mimeType: string;
  color?: string;
}

export interface GeneratedImageResponse {
  success: boolean;
  images: GeneratedImage[];
  count: number;
  analysis?: string;
  prompt?: string;
  message: string;
  metadata: {
    clothing_type: string;
    model_style: string;
    background: string;
    aspect_ratio: string;
    dominant_color: string;
  };
}

export interface ColorVariationResult {
  color: string;
  success: boolean;
  images?: GeneratedImage[];
  count?: number;
  error?: string;
}

export interface ColorVariationsResponse {
  success: boolean;
  results: ColorVariationResult[];
  summary: {
    totalColors: number;
    successfulColors: number;
    failedColors: number;
    totalImages: number;
    imagesPerColor: number;
  };
  structuralAnalysis?: string;
  metadata: {
    clothing_type: string;
    colors: string[];
    model_style: string;
    background: string;
    aspect_ratio: string;
  };
  message: string;
}

export interface HealthCheckResponse {
  success: boolean;
  message: string;
  apiKeyConfigured: boolean;
  models: {
    imageGeneration: string;
    imageAnalysis: string;
  };
  features: string[];
  endpoints: string[];
  timestamp: string;
}

export interface RecommendedColorsResponse {
  success: boolean;
  colors: {
    blues: string[];
    reds: string[];
    grays: string[];
    greens: string[];
    browns: string[];
    pinks: string[];
    purples: string[];
    neutrals: string[];
    others: string[];
  };
  tips: string[];
  examples: {
    [key: string]: string | string[];
  };
  usage: {
    singleImage: string;
    colorVariations: string;
  };
}

// ==================== FUNÇÕES DO SERVIÇO ====================

/**
 * Gera imagem de modelo profissional com a peça de roupa
 * Mantém a cor original da peça
 */
export const generateModelImage = async ({
  file,
  clothingType,
  modelStyle,
  background,
  dominantColor,
  numberOfImages = 1,
  aspectRatio = '3:4',
}: GenerateImageParams): Promise<GeneratedImageResponse> => {
  const formData = new FormData();
  formData.append('clothing_image', file);
  formData.append('clothing_type', clothingType);
  formData.append('model_style', modelStyle);
  formData.append('number_of_images', numberOfImages.toString());
  formData.append('aspect_ratio', aspectRatio);

  if (dominantColor) {
    formData.append('dominant_color', dominantColor);
  }

  if (background) {
    formData.append('background', background);
  }

  try {
    const response = await api.post<GeneratedImageResponse>(
      '/generation/generate-model-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Erro ao gerar imagem:', error);
    throw new Error(error.response?.data?.error || 'Erro ao gerar imagem do modelo');
  }
};

/**
 * Gera variações de cores da mesma peça de roupa
 * Mantém a estrutura/design, mas altera as cores
 */
export const generateColorVariations = async ({
  file,
  clothingType,
  colors,
  imagesPerColor = 1,
  modelStyle = 'professional',
  background = 'minimalist photography studio with professional lighting',
  aspectRatio = '3:4',
}: GenerateColorVariationsParams): Promise<ColorVariationsResponse> => {
  // Validações
  if (!colors || colors.length === 0) {
    throw new Error('É necessário fornecer pelo menos uma cor');
  }

  if (colors.some((c) => typeof c !== 'string' || c.trim() === '')) {
    throw new Error('Todas as cores devem ser strings não vazias');
  }

  const formData = new FormData();
  formData.append('clothing_image', file);
  formData.append('clothing_type', clothingType);
  formData.append('colors', JSON.stringify(colors));
  formData.append('images_per_color', imagesPerColor.toString());
  formData.append('model_style', modelStyle);
  formData.append('background', background);
  formData.append('aspect_ratio', aspectRatio);

  try {
    const response = await api.post<ColorVariationsResponse>(
      '/generation/generate-color-variations',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Erro ao gerar variações de cores:', error);
    throw new Error(error.response?.data?.error || 'Erro ao gerar variações de cores');
  }
};

/**
 * Verifica o status do serviço de geração de imagens
 */
export const checkHealth = async (): Promise<HealthCheckResponse> => {
  try {
    const response = await api.get<HealthCheckResponse>('/generation/health');
    return response.data;
  } catch (error: any) {
    console.error('Erro ao verificar status do serviço:', error);
    throw new Error(error.response?.data?.error || 'Erro ao verificar status do serviço');
  }
};

/**
 * Testa a API Imagen
 */
export const testImagenApi = async (): Promise<any> => {
  try {
    const response = await api.get('/generation/test');
    return response.data;
  } catch (error: any) {
    console.error('Erro ao testar API Imagen:', error);
    throw new Error(error.response?.data?.error || 'Erro ao testar API Imagen');
  }
};

/**
 * Obtém lista de cores recomendadas
 */
export const getRecommendedColors = async (): Promise<RecommendedColorsResponse> => {
  try {
    const response = await api.get<RecommendedColorsResponse>('/generation/colors');
    return response.data;
  } catch (error: any) {
    console.error('Erro ao obter cores recomendadas:', error);
    throw new Error(error.response?.data?.error || 'Erro ao obter cores recomendadas');
  }
};

// ==================== UTILIDADES ====================

/**
 * Converte base64 para blob URL para exibição
 */
export const base64ToUrl = (base64: string, mimeType: string = 'image/png'): string => {
  try {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Erro ao converter base64 para URL:', error);
    throw new Error('Erro ao processar imagem');
  }
};

/**
 * Converte base64 para data URL (para uso em <img src="">)
 */
export const base64ToDataUrl = (base64: string, mimeType: string = 'image/png'): string => {
  return `data:${mimeType};base64,${base64}`;
};

/**
 * Download de imagem
 */
export const downloadImage = (
  base64: string,
  filename: string,
  mimeType: string = 'image/png'
): void => {
  try {
    const link = document.createElement('a');
    link.href = base64ToDataUrl(base64, mimeType);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erro ao fazer download da imagem:', error);
    throw new Error('Erro ao fazer download da imagem');
  }
};

/**
 * Valida se o arquivo é uma imagem válida
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato não suportado. Use JPEG, PNG ou WebP.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Arquivo muito grande. Tamanho máximo: 10MB.',
    };
  }

  return { valid: true };
};

/**
 * Formata cor RGB para string
 */
export const formatRgbColor = (r: number, g: number, b: number): string => {
  return `${r},${g},${b}`;
};

/**
 * Parse de cor RGB de string
 */
export const parseRgbColor = (rgbString: string): { r: number; g: number; b: number } | null => {
  const match = rgbString.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);

  if (!match) {
    return null;
  }

  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3]),
  };
};

// ==================== CONSTANTES ====================

export const MODEL_STYLES = [
  { value: 'professional', label: 'Profissional' },
  { value: 'casual', label: 'Casual' },
  { value: 'elegant', label: 'Elegante' },
  { value: 'urban', label: 'Urbano' },
] as const;

export const ASPECT_RATIOS = [
  { value: '1:1', label: 'Quadrado (1:1)' },
  { value: '3:4', label: 'Vertical (3:4)' },
  { value: '4:3', label: 'Horizontal (4:3)' },
  { value: '9:16', label: 'Stories (9:16)' },
  { value: '16:9', label: 'Widescreen (16:9)' },
] as const;

export const BACKGROUNDS = [
  {
    value: 'minimalist photography studio with professional lighting',
    label: 'Estúdio Minimalista',
  },
  {
    value: 'white seamless background with soft lighting',
    label: 'Fundo Branco',
  },
  {
    value: 'urban city street background',
    label: 'Rua Urbana',
  },
  {
    value: 'natural outdoor setting with soft daylight',
    label: 'Ambiente Natural',
  },
  {
    value: 'modern interior with neutral tones',
    label: 'Interior Moderno',
  },
] as const;

export const POPULAR_COLORS = [
  'white',
  'black',
  'navy blue',
  'light pink',
  'heather gray',
  'burgundy red',
  'olive green',
  'camel tan',
] as const;

// ==================== EXPORT DEFAULT ====================

export default {
  generateModelImage,
  generateColorVariations,
  checkHealth,
  testImagenApi,
  getRecommendedColors,
  base64ToUrl,
  base64ToDataUrl,
  downloadImage,
  validateImageFile,
  formatRgbColor,
  parseRgbColor,
  MODEL_STYLES,
  ASPECT_RATIOS,
  BACKGROUNDS,
  POPULAR_COLORS,
};
