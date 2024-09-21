import { Badge } from '@/components/ui/badge';
import { Divider } from '@/components/ui/divider';
import { Heading, Subheading } from '@/components/ui/heading';
import { Select } from '@/components/ui/select';

import { LatestSales } from './components/latest-sales';
import { RecentInventoryChanges } from './components/recent-inventory-changes';
import { SalesTrend } from './components/sales-trend';
import { TopSellingProducts } from './components/top-selling-products';

export function Stat({
  title,
  subtitle,
  value,
  change,
}: {
  title: string;
  subtitle: string;
  value: string;
  change: string;
}) {
  return (
    <div>
      <Divider />
      <div className="mt-6 text-lg/6 font-medium sm:text-sm/6">{title}</div>
      <div className="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">{value}</div>
      <div className="mt-3 text-sm/6 sm:text-xs/6">
        <Badge color={change.startsWith('+') ? 'lime' : 'pink'}>{change}</Badge>{' '}
        <span className="text-zinc-500">{subtitle}</span>
      </div>
    </div>
  );
}

export const Dashboard = () => {
  return (
    <>
      <Heading>Good afternoon, Zain</Heading>
      <div className="mt-8 flex items-end justify-between">
        <Subheading>Overview</Subheading>
        <div>
          <Select name="period">
            <option value="last_day">Today's Sales</option>
            <option value="last_week">Last Week Sales</option>
            <option value="last_month">Last Month Sales</option>
            <option value="last_year">Year to Date Sales</option>
          </Select>
        </div>
      </div>
      <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Today's Sales" subtitle="from yesterday" value="&#8360; 455" change="+4.5%" />
        <Stat title="Last Week Sales" subtitle="from last week" value="&#8360; 10,455" change="-0.5%" />
        <Stat title="Last Month Sales" subtitle="from last month" value="&#8360; 288,454" change="+4.5%" />
        <Stat title="Year to Date Sales" subtitle="from last year" value="&#8360; 2.6M" change="+21.2%" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
        <SalesTrend />
        <TopSellingProducts />
        <LatestSales />
        <RecentInventoryChanges />
      </div>
    </>
  );
};
