import ListAllSales from '@/domains/sales/list-all-sales';
import { SalesDashboard } from '@/domains/sales/sales-summary';

export default function SalesPage() {
  return (
    <>
      <SalesDashboard />
      <ListAllSales />
    </>
  );
}
