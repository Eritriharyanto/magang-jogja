import { useMemo, useState } from "react";

const PAGE_SIZE = 20;

/**
 * Filter + pagination sisi client untuk list data yang sudah di-fetch
 * sepenuhnya dari API (Intent & Knowledge Base jumlahnya belum butuh
 * pencarian/pagination di level backend). `searchFields` adalah daftar
 * nama properti item yang ikut dicocokkan terhadap kata kunci.
 */
function usePaginatedSearch(items, searchFields) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  function updateQuery(value) {
    setQuery(value);
    setPage(1); // balik ke halaman 1 tiap kali kata kunci berubah
  }

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      searchFields.some((field) => String(item[field] ?? "").toLowerCase().includes(q))
    );
  }, [items, query, searchFields]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return {
    query,
    setQuery: updateQuery,
    page: safePage,
    setPage,
    totalPages,
    pageItems,
    totalFiltered: filtered.length,
    pageSize: PAGE_SIZE,
  };
}

export default usePaginatedSearch;
