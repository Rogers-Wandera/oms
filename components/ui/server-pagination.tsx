"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pagination, Group, Select, Text } from "@mantine/core";

interface ServerPaginationProps {
  totalPages: number;
  currentPage: number;
  pageSize?: number;
  totalRecords?: number;
}

export function ServerPagination({
  totalPages,
  currentPage,
  pageSize = 10,
  totalRecords,
}: ServerPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageSizeChange = (val: string | null) => {
    if (val) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("pageSize", val);
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  if (totalPages <= 1 && !totalRecords) return null;

  return (
    <Group justify="space-between" mt="md">
      <Group gap="xs">
        <Select
          size="sm"
          w={80}
          value={pageSize.toString()}
          onChange={handlePageSizeChange}
          data={["5", "10", "20", "50", "100"]}
          allowDeselect={false}
        />
        {totalRecords !== undefined && (
          <Text size="sm" c="dimmed">
            Total {totalRecords} records
          </Text>
        )}
      </Group>

      <Pagination
        total={totalPages}
        value={currentPage}
        onChange={handlePageChange}
        color="brand"
        radius="md"
        size="sm"
        withEdges
      />
    </Group>
  );
}
