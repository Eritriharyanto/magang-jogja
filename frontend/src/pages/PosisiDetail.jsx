import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Skeleton from "@/components/Skeleton";
import useApi from "@/hooks/useApi";
import { getDivisiDetail } from "@/api/divisiApi";
import ICON_FALLBACK from "@/data/iconFallback";

function PosisiDetail() {
  const { slug } = useParams();
  const {
    data: posisi,
    loading,
    error,
  } = useApi(() => getDivisiDetail(slug), [slug]);

  return (
    <div className='overflow-x-hidden bg-mj-green font-body'>
      <Header />

      <section className='bg-mj-yellow py-14'>
        <div className='mx-auto max-w-[900px] px-5 text-center'>
          <Link
            to='/#posisi'
            className='mb-6 inline-block text-[0.9rem] font-semibold text-white/90 transition-colors hover:text-mj-green-dark'
          >
            &larr; Kembali ke semua posisi
          </Link>

          {loading ? (
            <div className='mx-auto flex max-w-md flex-col items-center gap-4'>
              <Skeleton className='size-24 rounded-full' />
              <Skeleton className='h-8 w-2/3' />
            </div>
          ) : error || !posisi ? null : (
            <>
              <div className='mx-auto flex h-28 items-center justify-center'>
                <img
                  src={posisi.icon || ICON_FALLBACK[posisi.slug]}
                  alt=''
                  aria-hidden='true'
                  className='size-24 object-contain'
                />
              </div>
              <h1 className='mj-display mt-4 text-2xl leading-tight text-white md:text-3xl'>
                {posisi.label} {posisi.sub_label}
              </h1>
            </>
          )}
        </div>
      </section>

      <section className='bg-mj-green py-14'>
        <div className='mx-auto max-w-[720px] px-5'>
          {error ? (
            <div className='rounded-2xl bg-mj-green-dark p-8 text-center text-white'>
              <p>
                Posisi ini tidak ditemukan, atau terjadi masalah saat mengambil
                data.
              </p>
              <Link
                to='/#posisi'
                className='mt-4 inline-block text-[0.9rem] font-semibold text-mj-yellow hover:underline'
              >
                Kembali ke daftar posisi
              </Link>
            </div>
          ) : loading ? (
            <div className='space-y-4 rounded-2xl bg-mj-green-dark p-8'>
              <Skeleton className='h-5 w-1/3' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-5/6' />
              <Skeleton className='mt-6 h-5 w-1/4' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-4/6' />
              <Skeleton className='mt-6 h-12 w-full rounded-full' />
            </div>
          ) : (
            <div className='rounded-2xl bg-mj-green-dark p-8 text-white'>
              <h2 className='mj-display text-lg'>Tentang Posisi</h2>
              <p className='mt-3 text-[0.95rem] leading-relaxed'>
                {posisi.deskripsi}
              </p>

              <h2 className='mj-display mt-8 text-lg'>Jobdesk</h2>
              <ul className='mt-3 space-y-2'>
                {posisi.jobdesk.map((j) => (
                  <li
                    key={j.id}
                    className='flex gap-3 text-[0.95rem] leading-relaxed'
                  >
                    <span className='mt-1 text-mj-yellow'>&#9679;</span>
                    <span>{j.teks}</span>
                  </li>
                ))}
              </ul>

              <a
                href={posisi.gform_link}
                target='_blank'
                rel='noopener noreferrer'
                className='mt-8 block w-full rounded-full bg-mj-yellow py-3 text-center text-[0.95rem] font-bold uppercase text-mj-ink transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lg'
              >
                Daftar Posisi Ini
              </a>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default PosisiDetail;
