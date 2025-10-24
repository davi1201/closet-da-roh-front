'use client';

import dynamic from 'next/dynamic';

const ListAbandonedCarts = dynamic(
  () => import('@/domains/abandoned-carts/list-all-abandoned-carts'),
  { ssr: false }
);

export default function AbandonedCartsPage() {
  return <ListAbandonedCarts />;
}
