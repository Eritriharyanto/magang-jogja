import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import Toggle from "@/components/Toggle";
import Field, { Input, Textarea } from "@/components/Field";
import { LoadingState, ErrorState } from "@/components/StateViews";
import { useToast } from "@/context/ToastContext";
import { getKnowledgeDetail, createKnowledge, updateKnowledge } from "@/api/chatbotApi";

const EMPTY_FORM = { judul: "", konten: "", urutan: 0, aktif: true };

function KnowledgeForm() {
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
    getKnowledgeDetail(id).then(setForm).catch(setLoadError).finally(() => setLoading(false));
  }, [id, isEdit]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await updateKnowledge(id, form);
        showToast("Knowledge entry diperbarui.");
      } else {
        await createKnowledge(form);
        showToast("Knowledge entry baru ditambahkan.");
      }
      navigate("/chatbot/knowledge");
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
        title={isEdit ? "Edit Knowledge Entry" : "Tambah Knowledge Entry"}
        description="Tulis dalam kalimat natural -- ini yang dibaca Ollama sebagai konteks jawaban."
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-xl bg-white p-6 shadow-sm">
        <Field label="Judul" required>
          <Input value={form.judul} onChange={(e) => updateField("judul", e.target.value)} required />
        </Field>
        <Field label="Konten" required>
          <Textarea
            value={form.konten}
            onChange={(e) => updateField("konten", e.target.value)}
            rows={8}
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
          <Button type="button" variant="secondary" onClick={() => navigate("/chatbot/knowledge")}>
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

export default KnowledgeForm;
