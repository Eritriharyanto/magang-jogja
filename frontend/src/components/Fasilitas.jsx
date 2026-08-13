import fasilitasBg from "@/assets/fasilitas-bg.png";
import Reveal from "@/components/Reveal";
import Skeleton from "@/components/Skeleton";
import useApi from "@/hooks/useApi";
import { getFasilitas } from "@/api/homepageApi";

function Fasilitas() {
  const { data: fasilitas, loading, error } = useApi(() => getFasilitas(), []);

  return (
    <section
      id='fasilitas'
      className='relative overflow-hidden bg-mj-red bg-cover bg-center bg-no-repeat py-16'
      style={{ backgroundImage: `url(${fasilitasBg})` }}
    >
      <div className='relative mx-auto max-w-3xl px-5'>
        <h2 className='mj-display text-center text-[1.6rem] leading-tight text-white md:text-[1.8rem]'>
          Fasilitas yang
          <br />
          didapat
        </h2>
        <div className='mx-auto mt-6 h-px w-[22rem] max-w-full bg-white/70' />
        <div className='mx-auto mt-6 h-px w-[14rem] max-w-full bg-white/70' />

        {error ? (
          <p className='mt-12 text-center text-[0.9rem] text-white/80'>
            Gagal memuat fasilitas. Coba muat ulang halaman.
          </p>
        ) : (
          <ul className='mt-12 space-y-5'>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <li key={i}>
                    <Skeleton className='h-12 w-full rounded-[1.75rem]' />
                  </li>
                ))
              : fasilitas.map((f, i) => (
                  <Reveal key={f.id} delay={i * 70} as='li'>
                    <div className='rounded-[1.75rem] border-b-[6px] border-[#7a4a4a] bg-mj-yellow px-6 py-3 text-center text-[0.95rem] font-bold leading-snug text-mj-ink transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg'>
                      <span className='whitespace-pre-line'>{f.teks}</span>
                    </div>
                  </Reveal>
                ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default Fasilitas;
