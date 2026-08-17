import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import Field, { Input, Textarea } from "@/components/Field";
import { LoadingState, ErrorState } from "@/components/StateViews";
import { useToast } from "@/context/ToastContext";
import { getHero, updateHero } from "@/api/homepageApi";

function HeroEditor() {
  const { showToast } = useToast();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getHero()
      .then(setForm)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateHero(form);
      showToast("Konten Hero disimpan.");
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
        title="Konten Hero"
        description="Teks utama di bagian paling atas halaman (di bawah header)."
      />
      <form onSubmit={handleSubmit} className="max-w-xl space-y-5 rounded-xl bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Judul Baris 1">
            <Input value={form.judul_baris1} onChange={(e) => updateField("judul_baris1", e.target.value)} />
          </Field>
          <Field label="Judul Baris 2">
            <Input value={form.judul_baris2} onChange={(e) => updateField("judul_baris2", e.target.value)} />
          </Field>
        </div>
        <Field label="Sub-judul" hint="Teks tebal huruf besar di bawah judul.">
          <Textarea value={form.subjudul} onChange={(e) => updateField("subjudul", e.target.value)} />
        </Field>
        <Field label="Deskripsi">
          <Textarea value={form.deskripsi} onChange={(e) => updateField("deskripsi", e.target.value)} />
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

export default HeroEditor;
