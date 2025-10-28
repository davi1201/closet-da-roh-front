'use client';

import { useEffect, useState } from 'react';
import { getAllClients } from '@/domains/clients/client-service';
import { Client } from '@/domains/clients/types/client';

export function useClientMap() {
  const [clientsMap, setClientsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const clientsData = await getAllClients();
        const map: Record<string, string> = {};
        clientsData.forEach((client: Client) => {
          map[client._id] = client.name;
        });
        setClientsMap(map);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { clientsMap, loading };
}
