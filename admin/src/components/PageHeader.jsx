function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-mj-ink">{title}</h1>
        {description ? <p className="mt-1 text-sm text-black/50">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export default PageHeader;
