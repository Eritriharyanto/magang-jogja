function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <span
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-mj-green" : "bg-black/20"
        }`}
      >
        <span
          className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
      {label ? <span className="text-sm text-mj-ink">{label}</span> : null}
    </label>
  );
}

export default Toggle;
