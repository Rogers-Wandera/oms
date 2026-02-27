"use client";

import { useState } from "react";
import {
  Table,
  ScrollArea,
  TextInput,
  Pagination,
  Group,
  Text,
  Select,
  Stack,
  LoadingOverlay,
} from "@mantine/core";
import { Search } from "lucide-react";

interface DataTableProps<T> {
  data: T[];
  columns: {
    accessor: keyof T | string;
    title: string;
    render?: (record: T) => React.ReactNode;
    width?: number | string;
    align?: "left" | "center" | "right";
  }[];
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  pagination?: boolean;
  defaultPageSize?: number;
  loading?: boolean;
  onRowClick?: (record: T) => void;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchable = true,
  searchKeys = [],
  pagination = true,
  defaultPageSize = 10,
  loading = false,
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<string>(defaultPageSize.toString());

  // Filter
  const filteredData = data.filter((item) => {
    if (!search || searchKeys.length === 0) return true;
    return searchKeys.some((key) => {
      const val = item[key];
      if (typeof val === "string") {
        return val.toLowerCase().includes(search.toLowerCase());
      }
      return false;
    });
  });

  // Paginate
  const totalPages = Math.ceil(filteredData.length / parseInt(pageSize));
  const startIndex = (page - 1) * parseInt(pageSize);
  const paginatedData = pagination
    ? filteredData.slice(startIndex, startIndex + parseInt(pageSize))
    : filteredData;

  return (
    <Stack gap="md" pos="relative">
      <LoadingOverlay
        visible={loading}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />

      {searchable && (
        <Group justify="space-between">
          <TextInput
            placeholder="Search..."
            leftSection={<Search size={16} />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page
            }}
            w={{ base: "100%", sm: 300 }}
          />
          <Text size="sm" c="dimmed">
            {filteredData.length} records found
          </Text>
        </Group>
      )}

      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="sm" highlightOnHover striped>
          <Table.Thead>
            <Table.Tr>
              {columns.map((col, index) => (
                <Table.Th
                  key={index}
                  style={{
                    width: col.width,
                    textAlign: col.align || "left",
                  }}
                >
                  {col.title}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedData.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length} ta="center" py="xl">
                  <Text c="dimmed">No records found</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              paginatedData.map((record) => (
                <Table.Tr
                  key={record.id}
                  onClick={() => onRowClick && onRowClick(record)}
                  style={{
                    cursor: onRowClick ? "pointer" : "default",
                  }}
                >
                  {columns.map((col, index) => (
                    <Table.Td
                      key={index}
                      style={{ textAlign: col.align || "left" }}
                    >
                      {col.render
                        ? col.render(record)
                        : (record[col.accessor as keyof T] as React.ReactNode)}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {pagination && (
        <Group justify="space-between" mt="sm">
          <Select
            w={100}
            value={pageSize}
            onChange={(val) => {
              if (val) {
                setPageSize(val);
                setPage(1);
              }
            }}
            data={["5", "10", "20", "50", "100"]}
            comboboxProps={{ withinPortal: false }}
          />
          <Pagination
            total={totalPages}
            value={page}
            onChange={setPage}
            color="brand"
            radius="md"
          />
        </Group>
      )}
    </Stack>
  );
}
