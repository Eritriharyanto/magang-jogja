import heroBlob from "@/assets/hero.png";
import heroBg from "@/assets/hero-bg.png";
import studentPurple from "@/assets/student-purple.png";
import studentRed from "@/assets/student-red.png";
import useApi from "@/hooks/useApi";
import { getHero } from "@/api/homepageApi";

// Dipakai selagi data dari backend belum datang, supaya tidak ada
// layar kosong/kedip saat pertama kali halaman dibuka.
const HERO_FALLBACK = {
  judul_baris1: "Magang",
  judul_baris2: "Kuy!",
  subjudul:
    "Kamu siswa SMK atau Mahasiswa? Cari tempat PKL, Magang, Prakerin, OJT atau praktik Kerja?",
  deskripsi:
    "Seven Inc membuka kesempatan buat Kamu yang ingin menjajal pengalaman kerja di bisnis yang dijalankan Seven Inc",
};

function Hero() {
  const { data: hero } = useApi(() => getHero(), [], HERO_FALLBACK);
  const content = hero ?? HERO_FALLBACK;

  return (
    <section
      id="top"
      className="relative bg-mj-green bg-cover bg-bottom bg-no-repeat"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-6 px-5 py-10 md:grid-cols-2 md:py-16">
        <div className="relative mx-auto aspect-square w-full max-w-[520px] translate-x-[10%]">
          <img
            src={heroBlob}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-contain"
          />
          <img
            src={studentPurple}
            alt="Siswa magang melompat kegirangan"
            width={1457}
            height={1457}
            className="animate-mj-float absolute inset-0 size-full -translate-x-[24%] scale-90 object-contain"
          />
          <img
            src={studentRed}
            alt="Mahasiswa magang melompat sambil membawa buku"
            width={1457}
            height={1457}
            className="animate-mj-float-slow absolute inset-0 size-full -translate-x-[4%] scale-90 object-contain"
          />
        </div>

        <div className="animate-mj-bounce-in">
          <h1 className="mj-title text-[4.5rem] leading-[1.05] text-white md:text-[6.5rem]">
            {content.judul_baris1}
            <br />
            {content.judul_baris2}
          </h1>
          <p className="mt-6 max-w-lg text-[0.95rem] font-bold uppercase leading-snug tracking-wide text-mj-green-deep">
            {content.subjudul}
          </p>
          <p className="mt-5 max-w-lg text-[0.95rem] font-medium leading-snug text-white">
            {content.deskripsi}
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;
