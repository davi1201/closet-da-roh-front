import React, { useEffect, useRef, useState } from 'react';
import { IconCopy, IconPhoto } from '@tabler/icons-react';
import {
  Box,
  Button,
  Center,
  ColorSwatch,
  FileInput,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useClipboard } from '@mantine/hooks';

interface FormValues {
  file: File | null;
  clothingType: string;
  modelStyle: string;
  background: string;
}

interface ImageGeneratorProps {
  clothingType: string;
}

const FRAME_WAIST_UP =
  'The shot must be a medium shot (waist-up), framing the model from the waist up to highlight the item.';
const FRAME_WAIST_DOWN =
  'The shot must be a medium-long shot, focusing from the waist down to properly display the item.';
const FRAME_FULL_BODY = 'The shot must be a full-body shot to display the entire item.';
const FRAME_LEGS_FEET =
  'The shot must be a medium-long shot focusing on the legs and feet to display the footwear.';
const FRAME_ACCESSORY =
  'The shot must be a close-up or medium shot focused on the accessory, clearly showing how it is worn.';

const getFramingInstruction = (type: string): string => {
  switch (type) {
    // --- PARTES DE CIMA (WAIST-UP) ---
    case 'blazers':
    case 'blouses':
    case 'bodysuits': // Bodys são melhor exibidos com foco na parte superior
    case 'coats':
    case 'cardigans':
    case 'shirts':
    case 'tshirts':
    case 'tops': // Croppeds / Tops
    case 'jackets':
    case 'kimonos':
    case 'sweaters':
      return FRAME_WAIST_UP;

    // --- PARTES de BAIXO (WAIST-DOWN) ---
    case 'skirts':
    case 'jeans':
    case 'leggings':
    case 'pants':
    case 'shorts':
      return FRAME_WAIST_DOWN;

    // --- CORPO INTEIRO (FULL-BODY) ---
    case 'sets': // Conjuntos
    case 'jumpsuits': // Macacões
    case 'overalls': // Jardineiras
    case 'dresses': // Vestidos
      return FRAME_FULL_BODY;

    // --- ITENS ESPECÍFICOS ---
    case 'footwear': // Calçados
      return FRAME_LEGS_FEET;

    case 'accessories': // Acessórios
      return FRAME_ACCESSORY;

    // --- PADRÃO (ITENS AMBÍGUOS OU DE CORPO INTEIRO) ---
    case 'activewear': // Pode ser top, bottom ou conjunto
    case 'beachwear': // Pode ser biquíni ou saída de praia
    case 'lingerie':
    case 'loungewear':
    case 'sleepwear':
    default:
      return FRAME_FULL_BODY;
  }
};

export const ImageGenerator = ({ clothingType }: ImageGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const clipboard = useClipboard({ timeout: 1000 });

  const form = useForm<FormValues>({
    initialValues: {
      file: null,
      clothingType: clothingType,
      modelStyle: 'profissional',
      background: '',
    },
    validate: {
      file: (value) => {
        if (!value) return 'A imagem da roupa é obrigatória';
        if (value.size > 10 * 1024 ** 2) {
          return 'A imagem não pode ter mais que 10MB';
        }
        return null;
      },
    },
  });

  // Sincroniza o valor do formulário se a prop mudar
  useEffect(() => {
    form.setFieldValue('clothingType', clothingType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clothingType]);

  useEffect(() => {
    const file = form.values.file;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    if (!file) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHoverColor(null);
      setSelectedColor(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    setHoverColor(null);
    setSelectedColor(null);
  }, [form.values.file]);

  useEffect(() => {
    const { values } = form; // values.clothingType vem da prop

    // Só gera o prompt se tiver os dados essenciais
    if (values.file && values.clothingType.trim() && selectedColor) {
      // 1. Pega a instrução de enquadramento dinâmica
      const framingInstruction = getFramingInstruction(values.clothingType);

      // 2. Define um cenário padrão se o usuário não preencher
      const setting = values.background.trim() ? values.background : 'neutral studio background';

      // 3. Monta o novo prompt estruturado
      let prompt = `Create a photorealistic, high-resolution image of a professional model wearing the provided clothing item.

**Core Constraints:**
* **Aspect Ratio:** 4:3 (strictly)
* **Framing:** ${framingInstruction}
* **Style:** ${values.modelStyle} (e.g., professional, elegant, casual)
* **Setting:** ${setting}

**Item Details:**
* **Item Type:** ${values.clothingType}
* **Main Color:** rgb(${selectedColor})

**Final Instruction:**
The model must be wearing the item, perfectly matching its original texture and the specified main color. The final image must adhere to all constraints.`;

      setGeneratedPrompt(prompt);
    } else {
      setGeneratedPrompt('');
    }
    // A dependência de form.values já inclui clothingType
  }, [form.values, selectedColor]);

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    setHoverColor(`${pixel[0]},${pixel[1]},${pixel[2]}`);
  };

  const handleMouseClick = () => {
    setSelectedColor(hoverColor);
  };

  return (
    <Box>
      <Paper shadow="xl" radius="lg" p="xl" maw={800} w="100%">
        <Title order={1}>🎨 Gerador de Prompt para Modelo</Title>
        <Text c="dimmed" mb="xl">
          Preencha os dados e selecione a cor para gerar o prompt
        </Text>

        <Stack>
          <FileInput
            label="1. Imagem da Roupa"
            placeholder="Clique para enviar um arquivo..."
            leftSection={<IconPhoto size={16} />}
            accept="image/png,image/jpeg,image/webp, image/heic"
            required
            {...form.getInputProps('file')}
          />

          {form.values.file && (
            <Paper withBorder p="md" radius="md">
              <Stack>
                <Text fw={500}>2. Inspecione a Cor (Clique para selecionar)</Text>
                <Center>
                  <canvas
                    ref={canvasRef}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      maxHeight: '400px',
                      cursor: 'crosshair',
                      borderRadius: '4px',
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoverColor(null)}
                    onClick={handleMouseClick}
                  />
                </Center>
                <Group justify="space-around">
                  <Stack align="center" gap="xs">
                    <Text size="sm" c="dimmed">
                      Cor sob o cursor
                    </Text>
                    <ColorSwatch
                      color={hoverColor ? `rgb(${hoverColor})` : '#E9ECEF'}
                      size={30}
                      radius="sm"
                      withShadow
                    />
                  </Stack>
                  <Stack align="center" gap="xs">
                    <Text size="sm" fw={700}>
                      Cor Selecionada
                    </Text>
                    <ColorSwatch
                      color={selectedColor ? `rgb(${selectedColor})` : '#E9ECEF'}
                      size={30}
                      radius="sm"
                      withShadow
                    />
                  </Stack>
                </Group>
              </Stack>
            </Paper>
          )}

          <Select
            label="3. Estilo da Foto"
            data={[
              { value: 'profissional', label: 'Profissional' },
              { value: 'casual', label: 'Casual' },
              { value: 'elegante', label: 'Elegante' },
              { value: 'urbano', label: 'Urbano' },
            ]}
            required
            {...form.getInputProps('modelStyle')}
          />

          <TextInput
            label="4. Cenário (opcional)"
            placeholder="Ex: estúdio branco minimalista, rua urbana..."
            {...form.getInputProps('background')}
          />

          {generatedPrompt && (
            <Paper withBorder p="md" radius="md" mt="md" shadow="xs">
              <Stack>
                <Text fw={700}>✅ Prompt Gerado</Text>
                <Textarea value={generatedPrompt} readOnly minRows={7} autosize />
                <Tooltip
                  label={clipboard.copied ? 'Copiado!' : 'Copiar Prompt'}
                  withArrow
                  position="top"
                >
                  <Button
                    onClick={() => clipboard.copy(generatedPrompt)}
                    leftSection={<IconCopy size={16} />}
                    variant="light"
                    color={clipboard.copied ? 'teal' : 'blue'}
                  >
                    {clipboard.copied ? 'Copiado!' : 'Copiar Prompt'}
                  </Button>
                </Tooltip>
                <Text size="sm" c="dimmed">
                  Agora, cole este prompt junto com a imagem da roupa no seu aplicativo Gemini.
                </Text>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default ImageGenerator;
