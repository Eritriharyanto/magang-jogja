import Bar from "@/components/Bar";
import Reveal from "@/components/Reveal";
import Skeleton from "@/components/Skeleton";
import useApi from "@/hooks/useApi";
import { getSyarat } from "@/api/homepageApi";

function Syarat() {
  const { data: syarat, loading, error } = useApi(() => getSyarat(), []);

  return (
    <>
      <section id='syarat' className='bg-mj-yellow py-6'>
        <h2 className='mj-display text-center text-xl text-white md:text-[1.35rem]'>
          Syarat dan Ketentuan
        </h2>
      </section>
      <Bar color='bg-mj-red' />
      <Bar color='bg-mj-purple' />

      <section className='bg-mj-green py-16'>
        <div className='mx-auto max-w-[1200px] px-5'>
          {error ? (
            <p className='text-center text-[0.9rem] text-white/80'>
              Gagal memuat syarat & ketentuan. Coba muat ulang halaman.
            </p>
          ) : (
            <div className='grid gap-x-8 gap-y-16 md:grid-cols-3'>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className='flex flex-col items-center gap-2'>
                      <Skeleton className='h-4 w-3/4' />
                      <Skeleton className='h-4 w-1/2' />
                    </div>
                  ))
                : syarat.map((s, i) => (
                    <Reveal
                      key={s.id}
                      delay={i * 100}
                      className='flex flex-col items-center justify-end text-center'
                    >
                      <p className='max-w-xs whitespace-pre-line text-[0.95rem] leading-relaxed text-white'>
                        {s.teks}
                      </p>
                    </Reveal>
                  ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Syarat;
