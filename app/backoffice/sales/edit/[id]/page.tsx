'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { EditSaleForm } from '@/domains/sales/edit-sale';
import { getSaleById } from '@/domains/sales/sale-service';
import { SaleResponse } from '@/domains/sales/types/types';

export default function EditSalePage() {
  return (
    <>
      <EditSaleForm />
    </>
  );
}
