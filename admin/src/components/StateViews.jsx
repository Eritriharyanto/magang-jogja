export function LoadingState({ label = "Memuat data..." }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-black/50">
      <span className="size-4 animate-spin rounded-full border-2 border-mj-green border-t-transparent" />
      {label}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
      <p>{error?.message || "Terjadi kesalahan."}</p>
      {onRetry ? (
        <button onClick={onRetry} className="mt-2 font-semibold underline">
          Coba lagi
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ label = "Belum ada data." }) {
  return <p className="py-12 text-center text-sm text-black/40">{label}</p>;
}
