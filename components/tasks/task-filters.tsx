"use client";

import { TextInput, Select, Group, Button, Card } from "@mantine/core";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedValue } from "@mantine/hooks";

export function TaskFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch] = useDebouncedValue(search, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }

    params.set("page", "1"); // Reset to page 1 on filter
    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearch]);

  const handleClear = () => {
    setSearch("");
    router.push(pathname);
  };

  return (
    <Card withBorder padding="sm" radius="md" mb="md" className="premium-card">
      <Group gap="sm">
        <TextInput
          placeholder="Search tasks..."
          leftSection={<Search size={14} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          size="sm"
          radius="md"
          style={{ flex: 1 }}
        />
        <Button
          variant="light"
          color="gray"
          onClick={handleClear}
          leftSection={<X size={14} />}
          size="sm"
          radius="md"
          className="max-w-[120px]"
        >
          Clear
        </Button>
      </Group>
    </Card>
  );
}
