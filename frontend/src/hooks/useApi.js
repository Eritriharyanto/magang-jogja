import { useEffect, useState } from "react";

/**
 * Manggil fungsi API (dari folder src/api/) dan otomatis kelola
 * state loading, error, dan data-nya.
 *
 * Pakai initialData supaya komponen punya sesuatu buat ditampilkan
 * sebelum request selesai (menghindari layar kosong/kedip).
 *
 * Contoh:
 *   const { data, loading, error } = useApi(() => getHero(), []);
 */
function useApi(fetchFn, deps = [], initialData = null) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // Pola fetch-di-effect ini disengaja (loading/error state disetel di awal
    // effect sebelum request jalan) -- ini pola standar untuk data fetching,
    // bukan kasus yang dimaksud aturan lint ini.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    fetchFn()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Cegah "setState setelah unmount" kalau komponen keburu dilepas
    // sebelum request selesai (misal user cepat pindah halaman).
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

export default useApi;
