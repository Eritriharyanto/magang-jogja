import Reveal from "@/components/Reveal";
import { POSISI } from "@/data/content";

function Posisi() {
  return (
    <section id='posisi' className='bg-mj-yellow py-16'>
      <div className='mx-auto max-w-[1200px] px-5'>
        <h2 className='mj-display text-center text-[1.6rem] leading-tight text-white md:text-[1.8rem]'>
          Formasi Magang
          <br />
          Untuk Kamu
        </h2>
        <p className='mx-auto mt-6 max-w-3xl text-center text-[0.95rem] font-bold text-white'>
          Beragam formasi yang kami sediakan sudah siap dengan tim ahli /
          pembimbing yang akan menemani magangmu
        </p>

        <div className='mt-10 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4'>
          {POSISI.map((p, i) => (
            <Reveal
              key={p.label}
              delay={(i % 4) * 80}
              className='group flex flex-col items-center'
            >
              <div className='flex h-28 items-center justify-center'>
                <img
                  src={p.icon}
                  alt=''
                  aria-hidden='true'
                  loading='lazy'
                  className='size-24 object-contain transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110'
                />
              </div>
              <div className='mt-3 flex min-h-[3.5rem] w-full flex-col items-center justify-center rounded-lg bg-mj-green px-4 py-2 text-center leading-tight text-white transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-mj-green-dark group-hover:shadow-lg'>
                <span className='text-[1.05rem] font-medium uppercase'>
                  {p.label}
                </span>
                {p.sub ? (
                  <span className='text-[0.85rem] font-semibold uppercase'>
                    {p.sub}
                  </span>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Posisi;
