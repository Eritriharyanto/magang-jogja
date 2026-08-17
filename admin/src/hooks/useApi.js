import { useCallback, useEffect, useState } from "react";

/**
 * Manggil fungsi API dan otomatis kelola state loading/error/data.
 * Return juga `refetch` supaya bisa dipanggil ulang manual (misal setelah
 * create/update/delete berhasil, biar list ke-refresh tanpa reload halaman).
 *
 * `reloadKey` dipakai sebagai trigger tambahan di effect deps -- literal
 * angka yang di-increment tiap kali refetch() dipanggil manual, supaya
 * eslint-plugin-react-hooks tetap bisa memvalidasi effect deps dengan
 * benar (tidak seperti spread `...deps` dinamis yang sulit dianalisis).
 */
function useApi(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

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

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  return { data, loading, error, refetch, setData };
}

export default useApi;
