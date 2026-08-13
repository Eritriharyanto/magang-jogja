import footerIllustration from "@/assets/beges.png";
import useApi from "@/hooks/useApi";
import { getKontak } from "@/api/homepageApi";

const KONTAK_FALLBACK = {
  nomor_telepon: "0895 2900 2944",
  alamat:
    "Jl. Janti Gg. Arjuna No. 59, Karangjambe, Banguntapan, Bantul, Yogyakarta 55198",
};

// Ubah "0895 2900 2944" jadi "+6289529002944" biar link tel: valid.
function toTelHref(nomor) {
  const digits = nomor.replace(/\D/g, "");
  const withCountryCode = digits.startsWith("0")
    ? `62${digits.slice(1)}`
    : digits;
  return `tel:+${withCountryCode}`;
}

function Footer() {
  const { data: kontak } = useApi(() => getKontak(), [], KONTAK_FALLBACK);
  const content = kontak ?? KONTAK_FALLBACK;

  return (
    <footer
      id='tentang'
      className='relative min-h-[520px] overflow-hidden bg-mj-orange sm:min-h-[620px] md:min-h-[760px]'
    >
      <img
        src={footerIllustration}
        alt='Peserta magang merayakan keberhasilan'
        loading='lazy'
        className='absolute inset-0 size-full object-cover object-top'
      />
      <div className='relative z-10 mx-auto max-w-[900px] px-5 pt-16 text-center'>
        <p className='mj-title text-[3rem] normal-case tracking-tight text-white md:text-[4.2rem]'>
          magangjogja.com
        </p>
        <p className='mt-4 text-[0.95rem] font-medium uppercase text-white'>
          More Info
        </p>
        <p className='text-[0.95rem] font-bold text-white'>Kontak</p>
        <a
          href={toTelHref(content.nomor_telepon)}
          className='mt-1 block text-[2rem] font-bold text-mj-pink transition-opacity hover:opacity-80'
        >
          {content.nomor_telepon}
        </a>
        <p className='mt-2 text-[0.9rem] font-semibold text-white'>
          <span className='font-bold'>Alamat kantor pusat</span>{" "}
          {content.alamat}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
