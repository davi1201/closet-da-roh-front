'use client';

import React from 'react';
import { IconEye, IconPencil, IconTrash } from '@tabler/icons-react';
import { ActionIcon, Group, TableData } from '@mantine/core';
import { SupplierResponse } from './types/supplier';

interface ActionHandlers {
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export const prepareSupplierTableData = (
  data: SupplierResponse[],
  handlers: ActionHandlers
): TableData => {
  const headers = ['Nome', 'Email', 'Vendedora', 'Telefone', 'Ações'];

  // 2. Mapeamento das linhas para o formato [valor1, valor2, valor3, ...]
  const rows = data.map((item) => {
    // Coluna de AÇÕES (o mesmo JSX.Element que você criou)
    const acoesComponent = (
      <Group gap="xs" wrap="nowrap">
        {/* Visualizar */}
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={() => handlers.onView(item._id)}
          title="Visualizar detalhes"
        >
          <IconEye size={18} />
        </ActionIcon>

        {/* Editar */}
        <ActionIcon
          variant="subtle"
          color="blue"
          onClick={() => handlers.onEdit(item._id)}
          title="Editar fornecedor"
        >
          <IconPencil size={18} />
        </ActionIcon>

        {/* Excluir */}
        <ActionIcon
          variant="subtle"
          color="red"
          onClick={() => handlers.onDelete(item._id)}
          title="Excluir fornecedor"
        >
          <IconTrash size={18} />
        </ActionIcon>
      </Group>
    );

    // RETORNA UM ARRAY COM OS VALORES DAS CÉLULAS NA ORDEM DO CABEÇALHO
    return [
      item.name,
      item.contact.email,
      item.contact.contact_person,
      item.contact.phone,
      acoesComponent, // O JSX.Element é um tipo válido de ReactNode
    ];
  });

  return {
    caption: undefined,
    head: headers,
    body: rows, // Agora 'rows' é do tipo ReactNode[][], que Mantine espera
  };
};
