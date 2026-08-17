import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import Toggle from "@/components/Toggle";
import Field, { Input, Textarea } from "@/components/Field";
import { LoadingState, ErrorState } from "@/components/StateViews";
import { useToast } from "@/context/ToastContext";
import { getIntentDetail, createIntent, updateIntent } from "@/api/chatbotApi";

const EMPTY_FORM = {
  nama: "",
  kategori: "",
  contoh_pertanyaan_text: "",
  keywords_text: "",
  jawaban: "",
  urutan: 0,
  aktif: true,
};

function IntentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getIntentDetail(id)
      .then((data) => {
        setForm({
          nama: data.nama,
          kategori: data.kategori,
          contoh_pertanyaan_text: (data.contoh_pertanyaan || []).join("\n"),
          keywords_text: (data.keywords || []).join(", "),
          jawaban: data.jawaban,
          urutan: data.urutan,
          aktif: data.aktif,
        });
      })
      .catch(setLoadError)
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      nama: form.nama,
      kategori: form.kategori,
      jawaban: form.jawaban,
      urutan: form.urutan,
      aktif: form.aktif,
      contoh_pertanyaan: form.contoh_pertanyaan_text
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      keywords: form.keywords_text
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      if (isEdit) {
        await updateIntent(id, payload);
        showToast("Intent diperbarui.");
      } else {
        await createIntent(payload);
        showToast("Intent baru ditambahkan.");
      }
      navigate("/chatbot/intents");
    } catch (err) {
      showToast(err.message || "Gagal menyimpan.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;
  if (loadError) return <ErrorState error={loadError} />;

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Intent" : "Tambah Intent Baru"}
        description="Isi banyak variasi contoh kalimat -- makin variatif, makin akurat chatbot mengenali pertanyaan serupa."
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-xl bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nama Intent" required hint="ID unik, mis. 'tanya_syarat_pendaftaran'.">
            <Input value={form.nama} onChange={(e) => updateField("nama", e.target.value)} required />
          </Field>
          <Field label="Kategori" hint="Opsional, buat pengelompokan di admin.">
            <Input value={form.kategori} onChange={(e) => updateField("kategori", e.target.value)} />
          </Field>
        </div>

        <Field
          label="Contoh Pertanyaan"
          required
          hint="Satu kalimat per baris. Makin banyak variasi, makin akurat."
        >
          <Textarea
            value={form.contoh_pertanyaan_text}
            onChange={(e) => updateField("contoh_pertanyaan_text", e.target.value)}
            rows={10}
            placeholder={"syarat daftar magang apa aja\npersyaratan buat magang disini apa\n..."}
            required
          />
        </Field>

        <Field label="Keywords" hint="Opsional, pisahkan dengan koma. Bisa dikosongkan.">
          <Input
            value={form.keywords_text}
            onChange={(e) => updateField("keywords_text", e.target.value)}
            placeholder="syarat, persyaratan, daftar"
          />
        </Field>

        <Field label="Jawaban" required>
          <Textarea
            value={form.jawaban}
            onChange={(e) => updateField("jawaban", e.target.value)}
            rows={5}
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Urutan">
            <Input
              type="number"
              value={form.urutan}
              onChange={(e) => updateField("urutan", Number(e.target.value))}
            />
          </Field>
          <div className="flex items-end pb-2">
            <Toggle checked={form.aktif} onChange={(v) => updateField("aktif", v)} label="Aktif" />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-black/10 pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate("/chatbot/intents")}>
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

export default IntentForm;
