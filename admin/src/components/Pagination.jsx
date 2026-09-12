/** Nomor halaman yang ditampilkan: selalu 1 & halaman terakhir, plus
 * jendela di sekitar halaman aktif; sisanya diringkas jadi "...". */
function getPageWindow(page, totalPages) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  return [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
}

function Pagination({ page, totalPages, onChange, totalItems, pageSize }) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageWindow(page, totalPages);
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-black/45">
        Menampilkan {start}-{end} dari {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-mj-ink hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          &larr; Prev
        </button>

        {pageNumbers.map((p, i) => {
          const prev = pageNumbers[i - 1];
          const gap = prev !== undefined && p - prev > 1;
          return (
            <span key={p} className="flex items-center">
              {gap ? <span className="px-1.5 text-sm text-black/30">&hellip;</span> : null}
              <button
                onClick={() => onChange(p)}
                className={`min-w-8 rounded-lg px-2.5 py-1.5 text-sm font-medium ${
                  p === page ? "bg-mj-green text-white" : "text-mj-ink hover:bg-black/5"
                }`}
              >
                {p}
              </button>
            </span>
          );
        })}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-mj-ink hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}

export default Pagination;
