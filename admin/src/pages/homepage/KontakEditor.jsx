import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import Field, { Input, Textarea } from "@/components/Field";
import { LoadingState, ErrorState } from "@/components/StateViews";
import { useToast } from "@/context/ToastContext";
import { getKontak, updateKontak } from "@/api/homepageApi";

function KontakEditor() {
  const { showToast } = useToast();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getKontak()
      .then(setForm)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateKontak(form);
      showToast("Info kontak disimpan.");
    } catch (err) {
      showToast(err.message || "Gagal menyimpan.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div>
      <PageHeader
        title="Info Kontak"
        description="Nomor telepon & alamat ini tampil di footer website, DAN dipakai chatbot untuk tombol WhatsApp/Google Maps."
      />
      <form onSubmit={handleSubmit} className="max-w-xl space-y-5 rounded-xl bg-white p-6 shadow-sm">
        <Field label="Nomor Telepon / WhatsApp" hint="Format bebas, mis. '0895 2900 2944'.">
          <Input
            value={form.nomor_telepon}
            onChange={(e) => setForm((p) => ({ ...p, nomor_telepon: e.target.value }))}
          />
        </Field>
        <Field label="Alamat Kantor">
          <Textarea
            value={form.alamat}
            onChange={(e) => setForm((p) => ({ ...p, alamat: e.target.value }))}
          />
        </Field>
        <div className="flex justify-end border-t border-black/10 pt-4">
          <Button type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default KontakEditor;
