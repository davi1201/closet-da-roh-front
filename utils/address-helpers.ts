interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface AddressResponse {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export const fetchAddressByZipCode = async (zipCode: string): Promise<AddressResponse> => {
  const cleanedZipCode = zipCode.replace(/\D/g, '');

  if (cleanedZipCode.length !== 8) {
    throw new Error('CEP inválido. O CEP deve conter 8 dígitos.');
  }

  const url = `https://viacep.com.br/ws/${cleanedZipCode}/json/`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro ao buscar CEP: ${response.statusText} (Status: ${response.status})`);
    }

    const data: ViaCepResponse = await response.json();

    if (data.erro) {
      throw new Error('CEP não encontrado.');
    }

    return {
      street: data.logradouro,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
    };
  } catch (error) {
    console.error('Falha ao buscar endereço pelo CEP:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Ocorreu um erro desconhecido ao consultar o CEP.');
  }
};
