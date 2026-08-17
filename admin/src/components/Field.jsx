function Field({ label, hint, children, required }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-mj-ink">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-black/50">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-mj-green focus:ring-1 focus:ring-mj-green";

export function Input(props) {
  return <input className={inputClass} {...props} />;
}

export function Textarea(props) {
  return <textarea className={`${inputClass} resize-y`} rows={4} {...props} />;
}

export default Field;
