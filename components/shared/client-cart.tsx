'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Flex, Loader, Text } from '@mantine/core';
import AbandonedCartForm from '@/forms/abandoned-cart-form';
import { useClientMap } from '@/hooks/use-client-map';
import { useCartModalStore, useCartStore } from '@/store';
import { CheckoutSummary } from '../checkout/checkout-summary';
import { CartList } from './cart-list';

type CartView = 'LIST' | 'CHECKOUT' | 'CANCELING';

export function ClientCart() {
  const [view, setView] = useState<CartView>('LIST');

  const { carts, activeCartId, switchCart, removeFromCart, removeCart } = useCartStore();
  const activeCart = activeCartId ? carts[activeCartId] : null;

  const { clientsMap, loading: loadingClients } = useClientMap();

  const [saleCompletedId, setSaleCompletedId] = useState<string | null>(null);

  const isCartModalOpen = useCartModalStore((state) => state.isCartModalOpen);

  const handleGoToCheckout = () => setView('CHECKOUT');
  const handleGoToCancel = () => setView('CANCELING');
  const handleGoBackToList = () => setView('LIST');

  const handleSaleComplete = () => {
    setSaleCompletedId(activeCartId);
  };

  const handleFeedbackFinished = () => {
    if (saleCompletedId) {
      removeCart(saleCompletedId);
    }
    setSaleCompletedId(null);
    setView('LIST');
  };

  useEffect(() => {
    if (!isCartModalOpen && saleCompletedId) {
      removeCart(saleCompletedId);
      setSaleCompletedId(null);
      setView('LIST');
    }
  }, [isCartModalOpen, saleCompletedId, removeCart]);

  if (loadingClients) {
    return (
      <Flex align="center" justify="center" mih={100}>
        <Loader size="sm" />
        <Text ml="sm">Carregando dados dos clientes...</Text>
      </Flex>
    );
  }

  if (view === 'CHECKOUT') {
    if (!activeCart || !activeCartId) {
      return (
        <Alert color="red" title="Erro">
          Nenhum carrinho ativo encontrado.
          <Button onClick={handleGoBackToList} mt="md">
            Voltar
          </Button>
        </Alert>
      );
    }
    return (
      <CheckoutSummary
        cart={activeCart}
        cartId={activeCartId}
        onSaleComplete={handleSaleComplete}
        onFeedbackFinished={handleFeedbackFinished}
        onBack={handleGoBackToList}
      />
    );
  }

  const handleCancelSuccess = () => {
    if (activeCartId) {
      removeCart(activeCartId);
    }
    setView('LIST');
  };

  if (view === 'CANCELING') {
    if (!activeCart || !activeCartId) {
      return (
        <Alert color="red" title="Erro">
          Nenhum carrinho ativo encontrado.
          <Button onClick={handleGoBackToList} mt="md">
            Voltar
          </Button>
        </Alert>
      );
    }
    return (
      <AbandonedCartForm
        cart={activeCart}
        cartId={activeCartId}
        onSuccess={handleCancelSuccess}
        onCancel={handleGoBackToList}
      />
    );
  }

  return (
    <CartList
      carts={carts}
      activeCartId={activeCartId}
      clientsMap={clientsMap}
      onSwitchCart={switchCart}
      onRemoveItem={removeFromCart}
      onGoToCheckout={handleGoToCheckout}
      onGoToCancel={handleGoToCancel}
    />
  );
}
