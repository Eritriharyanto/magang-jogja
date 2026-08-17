function Button({ variant = "primary", className = "", ...props }) {
  const base = "rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-mj-green text-white hover:bg-mj-green-dark",
    secondary: "bg-white text-mj-ink border border-black/10 hover:bg-black/5",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-mj-green hover:bg-mj-green/10",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export default Button;
