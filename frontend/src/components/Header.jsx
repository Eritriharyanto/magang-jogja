import logo from "@/assets/logo.png";
import { NAV } from "@/data/content";

function Header() {
  return (
    <header className="sticky top-0 z-40 bg-mj-green-dark">
      <nav className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-5 py-4">
        <a href="#top" aria-label="magangjogja.com">
          <img src={logo} alt="magangjogja.com" width={552} height={63} className="h-6 w-auto" />
        </a>
        <ul className="flex flex-wrap items-center gap-x-8 gap-y-2">
          {NAV.map((n) => (
            <li key={n.href}>
              <a
                href={n.href}
                className="text-[0.95rem] font-medium text-white transition-colors hover:text-mj-yellow"
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
