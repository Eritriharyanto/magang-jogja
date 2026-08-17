import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import Toggle from "@/components/Toggle";
import Field, { Input, Textarea } from "@/components/Field";
import { LoadingState, ErrorState } from "@/components/StateViews";
import { useToast } from "@/context/ToastContext";
import { getDivisiDetail, createDivisi, updateDivisi } from "@/api/divisiApi";

const EMPTY_FORM = {
  label: "",
  sub_label: "",
  deskripsi: "",
  gform_link: "",
  urutan: 0,
  aktif: true,
  jobdesk: [""],
};

function DivisiForm() {
  const { slug } = useParams();
  const isEdit = Boolean(slug);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [iconFile, setIconFile] = useState(null);
  const [currentIconUrl, setCurrentIconUrl] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getDivisiDetail(slug)
      .then((data) => {
        setForm({
          label: data.label,
          sub_label: data.sub_label || "",
          deskripsi: data.deskripsi,
          gform_link: data.gform_link,
          urutan: data.urutan ?? 0,
          aktif: data.aktif ?? true,
          jobdesk: data.jobdesk.length ? data.jobdesk.map((j) => j.teks) : [""],
        });
        setCurrentIconUrl(data.icon);
      })
      .catch((err) => setLoadError(err))
      .finally(() => setLoading(false));
  }, [slug, isEdit]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateJobdesk(index, value) {
    setForm((prev) => ({
      ...prev,
      jobdesk: prev.jobdesk.map((j, i) => (i === index ? value : j)),
    }));
  }

  function addJobdeskRow() {
    setForm((prev) => ({ ...prev, jobdesk: [...prev.jobdesk, ""] }));
  }

  function removeJobdeskRow(index) {
    setForm((prev) => ({ ...prev, jobdesk: prev.jobdesk.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      jobdesk: form.jobdesk.map((j) => j.trim()).filter(Boolean),
      icon: iconFile,
    };
    try {
      if (isEdit) {
        await updateDivisi(slug, payload);
        showToast("Perubahan divisi disimpan.");
      } else {
        await createDivisi(payload);
        showToast("Divisi baru berhasil ditambahkan.");
      }
      navigate("/divisi");
    } catch (err) {
      showToast(err.message || "Gagal menyimpan divisi.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;
  if (loadError) return <ErrorState error={loadError} />;

  return (
    <div>
      <PageHeader
        title={isEdit ? `Edit Divisi: ${form.label}` : "Tambah Divisi Baru"}
        description="Data ini tampil di section 'Formasi Magang' dan halaman detail posisi."
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-xl bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nama Divisi" required>
            <Input
              value={form.label}
              onChange={(e) => updateField("label", e.target.value)}
              required
            />
          </Field>
          <Field label="Sub-label" hint="Opsional, baris kedua di kartu (mis. 'Frontend/Backend').">
            <Input value={form.sub_label} onChange={(e) => updateField("sub_label", e.target.value)} />
          </Field>
        </div>

        <Field label="Deskripsi" required>
          <Textarea
            value={form.deskripsi}
            onChange={(e) => updateField("deskripsi", e.target.value)}
            required
          />
        </Field>

        <Field label="Link Google Form Pendaftaran" required>
          <Input
            type="url"
            value={form.gform_link}
            onChange={(e) => updateField("gform_link", e.target.value)}
            placeholder="https://forms.gle/..."
            required
          />
        </Field>

        <Field label="Icon" hint="SVG/PNG, tampil di kartu posisi. Kosongkan untuk pakai icon lama.">
          {currentIconUrl ? (
            <img src={currentIconUrl} alt="" className="mb-2 size-12 object-contain" />
          ) : null}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setIconFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
        </Field>

        <div>
          <span className="mb-2 block text-sm font-semibold text-mj-ink">Jobdesk</span>
          <div className="space-y-2">
            {form.jobdesk.map((teks, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={teks}
                  onChange={(e) => updateJobdesk(i, e.target.value)}
                  placeholder={`Jobdesk #${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeJobdeskRow(i)}
                  className="shrink-0 rounded-lg px-3 text-sm text-red-600 hover:bg-red-50"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addJobdeskRow}
            className="mt-2 text-sm font-semibold text-mj-green hover:underline"
          >
            + Tambah baris jobdesk
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Urutan Tampil" hint="Angka kecil tampil lebih dulu.">
            <Input
              type="number"
              value={form.urutan}
              onChange={(e) => updateField("urutan", Number(e.target.value))}
            />
          </Field>
          <div className="flex items-end pb-2">
            <Toggle
              checked={form.aktif}
              onChange={(v) => updateField("aktif", v)}
              label="Tampilkan di website"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-black/10 pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate("/divisi")}>
            Batal
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default DivisiForm;
