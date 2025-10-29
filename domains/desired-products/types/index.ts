import { Client } from '@/domains/clients/types/client';

export type ImageObject = {
  _id: string;
  url: string;
  key?: string;
};

export type DesiredProductResponse = {
  _id: string;
  client: Client; // Corresponde ao Schema.Types.ObjectId (ref: 'Client')
  images: ImageObject[]; // Corresponde ao { type: String, required: true }
  description?: string; // Opcional, pois não é 'required'
  createdAt: string; // Adicionado por 'timestamps: true'
  updatedAt: string; // Adicionado por 'timestamps: true'
};

export type DesiredProductFormValues = {
  client: string; // O ID do cliente
  images: string; // Um link (URL) para a imagem
  description: string;
};
