function SearchInput({ value, onChange, placeholder = "Cari..." }) {
  return (
    <div className="relative">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/35"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-black/15 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-mj-green focus:ring-1 focus:ring-mj-green sm:w-72"
      />
    </div>
  );
}

export default SearchInput;
