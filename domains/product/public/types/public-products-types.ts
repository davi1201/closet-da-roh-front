export interface ClientPublic {
  _id: string;
  name: string;
}

export interface ProductPublic {
  _id: string;
  name: string;
  images: { url: string }[];
  // Adicione outros campos...
}

export interface InteractionData {
  clientId: string;
  productId: string;
  interaction: 'liked' | 'disliked';
}

export interface InteractionResponse {
  _id: string;
  client: string;
  product: string;
  interaction: 'liked' | 'disliked';
}
