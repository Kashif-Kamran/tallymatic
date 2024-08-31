import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ChevronDown } from 'lucide-react';
import { keepPreviousData } from '@tanstack/react-query';
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  Dropdown,
  DropdownButton,
  DropdownHeading,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownSection,
} from '@/components/ui/dropdown';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProducts } from '@/hooks/api/products';

import { useProductTableColumns } from '../hooks/use-product-table-columns';
import { ProductListSkeleton } from './product-list-skeleton';

const PAGE_SIZE = 20;

export const ProductListTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const offsetKey = `offset`;
  const offset = searchParams.get(offsetKey);

  const [globalFilter, setGlobalFilter] = React.useState('');
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: offset ? Math.ceil(Number(offset) / PAGE_SIZE) : 0,
    pageSize: PAGE_SIZE,
  });

  const {
    results = [],
    isLoading,
    isError,
    error,
    count,
  } = useProducts(
    {
      offset: offset ? Number(offset) : 0,
      limit: PAGE_SIZE,
      sortBy: sorting.map((sort) => `${sort.id}:${sort.desc ? 'desc' : 'asc'}`).join(',') || 'createdAt:desc',
      name: searchParams.has('name') ? searchParams.get('name') : undefined,
    },
    {
      placeholderData: keepPreviousData,
    }
  );

  const columns = useProductTableColumns();

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const onPaginationChange = (updater: (old: PaginationState) => PaginationState) => {
    const state = updater(pagination);
    const { pageIndex, pageSize } = state;

    setSearchParams((prev) => {
      if (!pageIndex) {
        prev.delete(offsetKey);
        return prev;
      }

      const newSearch = new URLSearchParams(prev);
      newSearch.set(offsetKey, String(pageIndex * pageSize));

      return newSearch;
    });

    setPagination(state);
    return state;
  };

  const onSortChange = (updater: (old: SortingState) => SortingState) => {
    const state = updater(sorting);

    setSearchParams((prev) => {
      if (!state.length) {
        prev.delete('sortBy');
        return prev;
      }

      const newSearch = new URLSearchParams(prev);
      newSearch.set('sortBy', state.map((sort) => `${sort.id}:${sort.desc ? 'desc' : 'asc'}`).join(','));

      return newSearch;
    });

    setSorting(state);
    return state;
  };

  const onGlobalFilterChange = (value: string) => {
    setSearchParams((prev) => {
      if (!value) {
        prev.delete('name');
        return prev;
      }

      const newSearch = new URLSearchParams(prev);
      newSearch.set('name', value);
      newSearch.delete(offsetKey);

      return newSearch;
    });

    setGlobalFilter(value);
  };

  const table = useReactTable({
    columns,
    data: results,
    rowCount: count,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: onSortChange as OnChangeFn<SortingState>,
    onPaginationChange: onPaginationChange as OnChangeFn<PaginationState>,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
  });

  if (isError) {
    throw error;
  }

  if (isLoading) {
    return <ProductListSkeleton />;
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 py-4">
        <Input
          placeholder="Filter products..."
          value={globalFilter ?? ''}
          onChange={(e) => onGlobalFilterChange(String(e.target.value))}
          className="max-w-sm"
        />
        <Dropdown>
          <DropdownButton outline aria-label="More options">
            Columns <ChevronDown className="ml-2 h-4 w-4" />
          </DropdownButton>
          <DropdownMenu anchor="top end">
            <DropdownSection>
              <DropdownHeading>Toggle Columns</DropdownHeading>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      </div>
      <Table className="mt-8 [--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHeader key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHeader>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
