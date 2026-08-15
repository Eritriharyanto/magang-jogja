import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import Skeleton from "@/components/Skeleton";
import useApi from "@/hooks/useApi";
import { getDivisiList } from "@/api/divisiApi";
import ICON_FALLBACK from "@/data/iconFallback";

function Posisi() {
  const { data: posisi, loading, error } = useApi(() => getDivisiList(), []);

  return (
    <section id="posisi" className="bg-mj-yellow py-16">
      <div className="mx-auto max-w-[1200px] px-5">
        <h2 className="mj-display text-center text-[1.6rem] leading-tight text-white md:text-[1.8rem]">
          Formasi Magang
          <br />
          Untuk Kamu
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-center text-[0.95rem] font-bold text-white">
          Beragam formasi yang kami sediakan sudah siap dengan tim ahli / pembimbing yang akan
          menemani magangmu
        </p>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[0.8rem] font-medium text-white/80">
          Klik salah satu posisi untuk lihat detail jobdesk dan link pendaftarannya
        </p>

        {error ? (
          <p className="mt-10 text-center text-[0.9rem] text-white/80">
            Gagal memuat daftar posisi magang. Coba muat ulang halaman.
          </p>
        ) : (
          <div className="mt-10 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-3">
                    <Skeleton className="size-24 rounded-full" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                ))
              : posisi.map((p, i) => (
                  <Reveal key={p.slug} delay={(i % 4) * 80}>
                    <Link
                      to={`/posisi/${p.slug}`}
                      className="group flex flex-col items-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-mj-green-dark focus-visible:ring-offset-2"
                    >
                      <div className="flex h-28 items-center justify-center">
                        <img
                          src={p.icon || ICON_FALLBACK[p.slug]}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          className="size-24 object-contain transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110"
                        />
                      </div>
                      <div className="mt-3 flex min-h-[3.5rem] w-full flex-col items-center justify-center rounded-lg bg-mj-green px-4 py-2 text-center leading-tight text-white transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-mj-green-dark group-hover:shadow-lg">
                        <span className="text-[1.05rem] font-medium uppercase">{p.label}</span>
                        {p.sub_label ? (
                          <span className="text-[0.85rem] font-semibold uppercase">
                            {p.sub_label}
                          </span>
                        ) : null}
                      </div>
                    </Link>
                  </Reveal>
                ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Posisi;
