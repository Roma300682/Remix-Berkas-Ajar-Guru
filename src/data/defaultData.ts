import { AppState, MonthItem, Semester, UnitItem, TpItem, ModulItem, LkpdItem } from '../types';

export const DIMENSIONS = [
  'Keimanan dan Ketakwaan kepada Tuhan YME',
  'Kewargaan',
  'Penalaran Kritis',
  'Kreativitas',
  'Kolaborasi',
  'Kemandirian',
  'Kesehatan',
  'Komunikasi'
];

export const TABS = [
  { id: 'mulai', l: 'Beranda' },
  { id: 'waktu', l: 'Analisis Waktu', n: 1 },
  { id: 'cpatp', l: 'CP–ATP', n: 2 },
  { id: 'prota', l: 'Program Tahunan', n: 3 },
  { id: 'promes', l: 'Program Semester', n: 4 },
  { id: 'kktp', l: 'KKTP', n: 5 },
  { id: 'modul', l: 'Modul Ajar', n: 6 },
  { id: 'lkpd', l: 'LKPD', n: 7 },
];

export const uid = () => Math.random().toString(36).slice(2, 9);

export const mon = (sem: Semester, nama: string, n: number, off: number[] = [], ket = ''): MonthItem => ({
  id: uid(),
  sem,
  nama,
  n,
  off,
  ket
});

export const getMonths = (withSampleOff: boolean): MonthItem[] => [
  mon(1, 'Juli', 3, withSampleOff ? [0] : [], withSampleOff ? 'Masa Pengenalan Lingkungan Sekolah' : ''),
  mon(1, 'Agustus', 4),
  mon(1, 'September', 4),
  mon(1, 'Oktober', 4, withSampleOff ? [1] : [], withSampleOff ? 'Asesmen sumatif tengah semester' : ''),
  mon(1, 'November', 4),
  mon(1, 'Desember', 3, withSampleOff ? [1, 2] : [], withSampleOff ? 'Asesmen sumatif akhir semester dan libur semester' : ''),
  mon(2, 'Januari', 4, withSampleOff ? [0] : [], withSampleOff ? 'Libur semester' : ''),
  mon(2, 'Februari', 4),
  mon(2, 'Maret', 4, withSampleOff ? [1, 2] : [], withSampleOff ? 'Libur hari raya dan cuti bersama' : ''),
  mon(2, 'April', 4),
  mon(2, 'Mei', 4, withSampleOff ? [2] : [], withSampleOff ? 'Asesmen sumatif tengah semester' : ''),
  mon(2, 'Juni', 3, withSampleOff ? [1, 2] : [], withSampleOff ? 'Asesmen sumatif akhir tahun dan libur kenaikan kelas' : '')
];

export const blankState = (): AppState => ({
  v: 1,
  sample: false,
  ui: {
    tab: 'mulai',
    sem: 1,
    doc: {},
    unit: null,
    unitL: null,
  },
  profil: {
    guru: '',
    nip: '',
    sekolah: '',
    mapel: '',
    fase: 'D',
    kelas: '',
    ta: '2026/2027',
    kepsek: '',
    nipKs: '',
    kota: '',
    tgl: '',
    jp: 4,
    menit: 40,
    b1: 60,
    b2: 75,
    b3: 90,
  },
  bulan: getMonths(false),
  cp: [],
  unit: [],
  tp: [],
  promes: {},
  modul: {},
  lkpd: {},
});

export const intiText = (s: string): string => {
  return String(s || '').trim().replace(/^peserta didik\s+(mampu|dapat)\s+/i, '').replace(/[.\s]+$/, '');
};

export const genKktp = (t: TpItem) => {
  const x = intiText(t.teks);
  return {
    ind: `Peserta didik dapat ${x}.`,
    r1: `Belum dapat ${x}; masih memerlukan bimbingan intensif dari guru.`,
    r2: `Dapat ${x} sebagian, dengan bantuan guru atau teman.`,
    r3: `Dapat ${x} secara mandiri dan tepat.`,
    r4: `Dapat ${x} secara mandiri dan tepat, serta mampu menjelaskan atau menerapkannya pada situasi baru.`,
    teknik: 'Observasi, tes tertulis, dan penugasan'
  };
};

export const genModul = (u: UnitItem): ModulItem => {
  const nm = u.nama || 'materi ini';
  const lcNm = nm ? nm.charAt(0).toLowerCase() + nm.slice(1) : nm;
  return {
    awal: `Peserta didik telah mempelajari konsep dasar yang menjadi prasyarat ${lcNm} pada pembelajaran sebelumnya.`,
    dimensi: ['Penalaran Kritis', 'Kolaborasi', 'Kemandirian'],
    sarana: 'Buku teks, LKPD, papan tulis, alat tulis; proyektor atau gawai bila tersedia.',
    target: 'Peserta didik reguler. Sediakan pendampingan tambahan bagi yang masih kesulitan dan tantangan lanjutan bagi yang cepat memahami.',
    model: 'Pembelajaran berbasis masalah dengan diskusi kelompok kecil dan presentasi hasil.',
    pemahaman: `${nm} dijumpai dalam kehidupan sehari-hari. Dengan memahaminya, peserta didik dapat mengambil keputusan dan menyelesaikan masalah secara tepat.`,
    pemantik: `1. Di mana kamu pernah menjumpai ${lcNm} dalam kehidupan sehari-hari?\n2. Apa yang terjadi jika kita keliru menerapkannya?`,
    pendahuluan: '1. Guru memberi salam, mengecek kehadiran, dan mengajak berdoa.\n2. Guru menyampaikan tujuan pembelajaran dan kaitannya dengan kehidupan sehari-hari.\n3. Guru mengajukan pertanyaan pemantik dan peserta didik menjawab secara singkat.\n4. Guru melakukan asesmen diagnostik singkat untuk mengetahui kesiapan belajar.',
    memahami: '1. Peserta didik mengamati contoh dan situasi yang disajikan guru.\n2. Peserta didik mendiskusikan konsep kunci dalam kelompok kecil.\n3. Guru membimbing penarikan kesimpulan konsep secara bersama.',
    mengaplikasi: '1. Peserta didik mengerjakan LKPD secara berkelompok.\n2. Peserta didik menerapkan konsep pada masalah kontekstual.\n3. Perwakilan kelompok mempresentasikan hasil dan menerima tanggapan.',
    merefleksi: '1. Peserta didik menuliskan bagian yang sudah dan belum dipahami.\n2. Peserta didik memberi umpan balik pada hasil kerja teman.\n3. Guru memberi penguatan dan umpan balik.',
    penutup: '1. Guru dan peserta didik menyimpulkan pembelajaran.\n2. Guru menyampaikan tugas lanjutan dan rencana pertemuan berikutnya.\n3. Berdoa dan salam penutup.',
    diagnostik: 'Pertanyaan singkat lisan atau tertulis di awal pembelajaran untuk memetakan pengetahuan prasyarat.',
    formatif: 'Observasi saat diskusi, penilaian LKPD, dan umpan balik tertulis. Acuan penilaian mengikuti KKTP pada bagian asesmen di bawah.',
    sumatif: 'Tes tertulis atau penugasan di akhir unit. Acuan penilaian mengikuti KKTP pada bagian asesmen di bawah.',
    remedial: 'Pembelajaran ulang dengan penjelasan yang disederhanakan, tutor sebaya, dan latihan terbimbing bagi peserta didik yang belum mencapai kriteria cukup.',
    pengayaan: 'Soal pemecahan masalah tingkat lanjut atau proyek mini bagi peserta didik yang telah mencapai kriteria sangat baik.',
    refGuru: '1. Apakah tujuan pembelajaran tercapai?\n2. Bagian mana yang perlu diperbaiki?\n3. Peserta didik mana yang perlu tindak lanjut?',
    refSiswa: '1. Apa yang paling kamu pahami hari ini?\n2. Bagian mana yang masih membingungkan?\n3. Apa yang akan kamu lakukan agar lebih paham?',
    pustaka: 'Isi dengan judul buku teks utama, penulis, penerbit, dan tahun terbit.'
  };
};

export const genLkpd = (u: UnitItem, tps: TpItem[]): LkpdItem => {
  const nm = u.nama || 'materi ini';
  const lcNm = nm ? nm.charAt(0).toLowerCase() + nm.slice(1) : nm;
  return {
    judul: `LKPD ${nm}`,
    petunjuk: '1. Tulis nama kelompok dan anggota pada tempat yang disediakan.\n2. Baca setiap petunjuk dan pertanyaan dengan teliti.\n3. Diskusikan bersama anggota kelompok sebelum menulis jawaban.\n4. Tanyakan kepada guru jika ada hal yang belum jelas.\n5. Kumpulkan LKPD setelah selesai.',
    tujuan: tps.map((t, i) => `${i + 1}. ${t.teks}`).join('\n'),
    alat: 'Alat tulis, buku catatan, dan bahan pendukung dari guru.',
    kegiatan: '1. Amati contoh atau situasi yang diberikan guru.\n2. Diskusikan bersama kelompokmu: apa yang sudah kamu ketahui dan apa yang ingin kamu cari tahu.\n3. Kerjakan tugas di bawah ini.',
    tugas: tps.map((t, i) => `Tugas ${i + 1}. Kerjakan dan tuliskan langkah penyelesaianmu untuk: ${intiText(t.teks)}.`).join('\n'),
    baris: 3,
    kesimpulan: `Tuliskan kesimpulan kelompokmu tentang ${lcNm}.`,
    refleksi: 'Beri tanda centang sesuai pemahamanmu setelah mengerjakan LKPD ini.'
  };
};

export const seedSampleData = (): AppState => {
  const s = blankState();
  s.sample = true;
  s.profil.mapel = 'Akuntansi';
  s.profil.fase = 'E';
  s.profil.kelas = 'X';
  s.bulan = getMonths(true);

  const cpList = [
    ['Proses Bisnis', 'Peserta didik mampu memahami proses bisnis bidang akuntansi dan keuangan lembaga secara menyeluruh pada berbagai jenis perusahaan.'],
    ['Perkembangan Teknologi', 'Peserta didik mampu memahami perkembangan teknologi di industri dan dunia kerja serta isu-isu global di bidang akuntansi.'],
    ['Profesi dan Kewirausahaan', 'Peserta didik mampu memahami profesi akuntansi, peluang kerja, serta berwirausaha di bidang akuntansi dan keuangan.'],
    ['Etika Profesi', 'Peserta didik mampu menerapkan etika profesi akuntansi dalam menjalankan tugas dan pekerjaan.'],
    ['Dasar Akuntansi', 'Peserta didik mampu memahami prinsip dan siklus akuntansi perusahaan jasa secara mendasar.']
  ];

  const E: Record<string, string> = {};
  cpList.forEach(c => {
    const o = { id: uid(), elemen: c[0], teks: c[1] };
    s.cp.push(o);
    E[c[0]] = o.id;
  });

  const addUnitWithTp = (sem: Semester, nama: string, el: string, tps: [string, number][]) => {
    const u: UnitItem = { id: uid(), sem, nama, cpId: E[el] };
    s.unit.push(u);
    tps.forEach(t => {
      s.tp.push({
        id: uid(),
        unitId: u.id,
        teks: `Peserta didik dapat ${t[0]}`,
        jp: t[1],
        ind: '',
        r1: '',
        r2: '',
        r3: '',
        r4: '',
        teknik: ''
      });
    });
    return u;
  };

  const u1 = addUnitWithTp(1, 'Proses Bisnis dan Lingkup Akuntansi', 'Proses Bisnis', [
    ['menjelaskan proses bisnis bidang akuntansi dan keuangan lembaga', 8],
    ['mengidentifikasi jenis-jenis perusahaan dalam dunia ekonomi', 12]
  ]);
  addUnitWithTp(1, 'Perkembangan Teknologi Akuntansi', 'Perkembangan Teknologi', [
    ['menjelaskan perkembangan teknologi digital pada bidang akuntansi dan keuangan', 8],
    ['menerapkan literasi digital dalam pencatatan keuangan', 8]
  ]);
  addUnitWithTp(1, 'Profesi dan Kewirausahaan Akuntansi', 'Profesi dan Kewirausahaan', [
    ['mengidentifikasi berbagai profesi di bidang akuntansi dan keuangan lembaga', 10],
    ['merencanakan peluang wirausaha di bidang jasa akuntansi', 10]
  ]);
  addUnitWithTp(2, 'Etika Profesi Akuntan', 'Etika Profesi', [
    ['menjelaskan prinsip-prinsip etika profesi akuntansi', 10],
    ['menerapkan kode etik akuntan dalam praktik pekerjaan sehari-hari', 14]
  ]);
  addUnitWithTp(2, 'Pengantar Siklus Akuntansi Perusahaan Jasa', 'Dasar Akuntansi', [
    ['menjelaskan persamaan dasar akuntansi dan mekanisme debet kredit', 16],
    ['melakukan pencatatan transaksi ke dalam jurnal umum perusahaan jasa', 16]
  ]);

  // Fill KKTP for first 3 TPs
  s.tp.slice(0, 3).forEach(t => {
    const k = genKktp(t);
    t.ind = k.ind;
    t.r1 = k.r1;
    t.r2 = k.r2;
    t.r3 = k.r3;
    t.r4 = k.r4;
    t.teknik = k.teknik;
  });

  const autoSebarSem = (sem: Semester, state: AppState) => {
    const bs = state.bulan.filter(b => b.sem === sem);
    const sl: string[] = [];
    bs.forEach(b => {
      for (let w = 0; w < b.n; w++) {
        if (!b.off.includes(w)) sl.push(`${b.id}:${w}`);
      }
    });
    const jpWeek = Number(state.profil.jp) || 1;
    const tps = state.unit.filter(u => u.sem === sem).flatMap(u => state.tp.filter(t => t.unitId === u.id));
    let cur = 0;
    tps.forEach(t => {
      const j = Number(t.jp) || 0;
      const set: string[] = [];
      if (j > 0) {
        const a = Math.floor(cur / jpWeek);
        const b = Math.ceil((cur + j) / jpWeek) - 1;
        for (let i = a; i <= b; i++) {
          if (sl[i]) set.push(sl[i]);
        }
      }
      state.promes[t.id] = set;
      cur += j;
    });
  };

  autoSebarSem(1, s);
  autoSebarSem(2, s);

  s.modul[u1.id] = genModul(u1);
  s.lkpd[u1.id] = genLkpd(u1, s.tp.filter(t => t.unitId === u1.id));
  s.ui.unit = u1.id;
  s.ui.unitL = u1.id;

  return s;
};
