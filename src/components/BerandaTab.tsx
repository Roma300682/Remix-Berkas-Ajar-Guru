import React, { useState } from 'react';
import { AppState, Semester } from '../types';
import { TABS } from '../data/defaultData';

interface BerandaTabProps {
  state: AppState;
  onChangeProfile: (key: string, value: any) => void;
  onTabSelect: (tabId: string) => void;
  onKeepSample: () => void;
  onResetAll: () => void;
  onRestore: (jsonStr: string) => void;
  showToast: (msg: string) => void;
}

export const BerandaTab: React.FC<BerandaTabProps> = ({
  state,
  onChangeProfile,
  onTabSelect,
  onKeepSample,
  onResetAll,
  onRestore,
  showToast
}) => {
  const p = state.profil;
  const [backupText, setBackupText] = useState(JSON.stringify(state));

  const jpAvail = (s: Semester) => {
    const bs = state.bulan.filter(b => b.sem === s);
    return bs.reduce((acc, b) => acc + (b.n - b.off.length) * (Number(p.jp) || 0), 0);
  };

  const jpTotal = (s: Semester) => {
    const uIds = state.unit.filter(u => u.sem === s).map(u => u.id);
    const tps = state.tp.filter(t => uIds.includes(t.unitId));
    return tps.reduce((acc, t) => acc + (Number(t.jp) || 0), 0);
  };

  const ratioSt = (r: number) => (r <= 0 ? 0 : r >= 1 ? 2 : 1);

  const getStatus = (id: string): number => {
    const n = state.tp.length;
    const U = state.unit.length;
    switch (id) {
      case 'mulai': {
        const fields = ['guru', 'sekolah', 'mapel', 'kelas', 'ta', 'kepsek'];
        const filled = fields.filter(k => Boolean((p as any)[k])).length;
        return ratioSt(filled / fields.length);
      }
      case 'waktu':
        return jpAvail(1) > 0 && jpAvail(2) > 0 ? 2 : jpAvail(1) > 0 || jpAvail(2) > 0 ? 1 : 0;
      case 'cpatp': {
        const r = n ? state.tp.filter(t => t.teks && Number(t.jp) > 0).length / n : 0;
        return ratioSt(state.cp.length ? r : Math.min(r, 0.5));
      }
      case 'prota':
        return !n ? 0 : jpTotal(1) <= jpAvail(1) && jpTotal(2) <= jpAvail(2) ? 2 : 1;
      case 'promes':
        return ratioSt(n ? state.tp.filter(t => (state.promes[t.id] || []).length).length / n : 0);
      case 'kktp':
        return ratioSt(n ? state.tp.filter(t => t.ind && t.r1 && t.r2 && t.r3 && t.r4).length / n : 0);
      case 'modul':
        return ratioSt(
          U
            ? state.unit.filter(u => {
                const m = state.modul[u.id];
                return m && m.pendahuluan && m.memahami;
              }).length / U
            : 0
        );
      case 'lkpd':
        return ratioSt(
          U
            ? state.unit.filter(u => {
                const l = state.lkpd[u.id];
                return l && l.tugas;
              }).length / U
            : 0
        );
      default:
        return 0;
    }
  };

  const getDetail = (id: string): string => {
    const n = state.tp.length;
    const U = state.unit.length;
    const mgSum = (s: Semester) => {
      const bs = state.bulan.filter(b => b.sem === s);
      return bs.reduce((acc, b) => acc + (b.n - b.off.length), 0);
    };
    switch (id) {
      case 'mulai':
        return 'Identitas guru dan sekolah';
      case 'waktu':
        return `${mgSum(1) + mgSum(2)} minggu efektif · ${jpAvail(1) + jpAvail(2)} JP`;
      case 'cpatp':
        return `${U} unit · ${n} TP`;
      case 'prota':
        return `${jpTotal(1) + jpTotal(2)} JP materi`;
      case 'promes':
        return `${state.tp.filter(t => (state.promes[t.id] || []).length).length} dari ${n} TP terjadwal`;
      case 'kktp':
        return `${state.tp.filter(t => t.ind && t.r1 && t.r2 && t.r3 && t.r4).length} dari ${n} TP lengkap`;
      case 'modul':
        return `${
          state.unit.filter(u => {
            const m = state.modul[u.id];
            return m && m.pendahuluan && m.memahami;
          }).length
        } dari ${U} unit`;
      case 'lkpd':
        return `${
          state.unit.filter(u => {
            const l = state.lkpd[u.id];
            return l && l.tugas;
          }).length
        } dari ${U} unit`;
      default:
        return '';
    }
  };

  const STL = ['Belum', 'Sebagian', 'Selesai'];

  const handleCopyBackup = () => {
    const json = JSON.stringify(state);
    navigator.clipboard.writeText(json);
    showToast('Cadangan disalin ke clipboard.');
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Berkas Ajar Guru
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-3xl text-sm lg:text-base">
          Susun tujuh perangkat ajar dalam satu alur. Data yang diisi pada satu berkas dipakai otomatis di berkas berikutnya, jadi perubahan cukup dilakukan sekali.
        </p>
      </div>

      {state.sample && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-amber-900 dark:text-amber-200 max-w-2xl m-0">
            <b>Data contoh ({p.mapel || 'Akuntansi'}).</b> Sudah terisi agar alur antarberkas terlihat. Anda dapat langsung mengubah mata pelajaran, menggunakan AI Generator di tab CP-ATP, atau mulai dari kosong.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onKeepSample}
              className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Pakai dan ubah data ini
            </button>
            <button
              onClick={onResetAll}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-red-50 text-red-600 border border-red-200 dark:border-red-900 rounded-lg text-xs font-medium transition-colors"
            >
              Mulai dari kosong
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 items-start">
        {/* Data Induk */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Data Induk</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              Nama guru
              <input
                type="text"
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
                value={p.guru}
                onChange={e => onChangeProfile('guru', e.target.value)}
                placeholder="Nama, gelar"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              NIP guru
              <input
                type="text"
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
                value={p.nip}
                onChange={e => onChangeProfile('nip', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              Satuan pendidikan
              <input
                type="text"
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
                value={p.sekolah}
                onChange={e => onChangeProfile('sekolah', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 sm:col-span-2">
              <div className="flex justify-between items-center">
                <span>Mata pelajaran / Bidang Keahlian</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">Pilih cepat:</span>
                  {['Akuntansi', 'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPAS', 'Informatika', 'PJOK'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => onChangeProfile('mapel', m)}
                      className={`px-2 py-0.5 text-[10px] rounded-md border transition-colors ${
                        p.mapel === m 
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                className="px-3 py-2 mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
                value={p.mapel}
                onChange={e => onChangeProfile('mapel', e.target.value)}
                placeholder="mis. Akuntansi, Matematika, dll."
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              Fase
              <select
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
                value={p.fase}
                onChange={e => onChangeProfile('fase', e.target.value)}
              >
                {['A', 'B', 'C', 'D', 'E', 'F'].map(f => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              Kelas
              <input
                type="text"
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
                value={p.kelas}
                onChange={e => onChangeProfile('kelas', e.target.value)}
                placeholder="mis. VII"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              Tahun pelajaran
              <input
                type="text"
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
                value={p.ta}
                onChange={e => onChangeProfile('ta', e.target.value)}
                placeholder="2026/2027"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              JP per minggu
              <input
                type="number"
                min="1"
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
                value={p.jp}
                onChange={e => onChangeProfile('jp', Number(e.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              Menit per 1 JP
              <input
                type="number"
                min="10"
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
                value={p.menit}
                onChange={e => onChangeProfile('menit', Number(e.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              Kepala sekolah
              <input
                type="text"
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
                value={p.kepsek}
                onChange={e => onChangeProfile('kepsek', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              NIP kepala sekolah
              <input
                type="text"
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
                value={p.nipKs}
                onChange={e => onChangeProfile('nipKs', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              Kota penandatanganan
              <input
                type="text"
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
                value={p.kota}
                onChange={e => onChangeProfile('kota', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 sm:col-span-2">
              Tanggal dokumen
              <input
                type="text"
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
                value={p.tgl}
                onChange={e => onChangeProfile('tgl', e.target.value)}
                placeholder="mis. 13 Juli 2026"
              />
            </label>
          </div>
        </section>

        {/* Right Stack: Kebutuhan JP & Kemajuan Berkas */}
        <div className="flex flex-col gap-6">
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Kebutuhan JP</h2>
            {[1, 2].map(s => {
              const sem = s as Semester;
              const avail = jpAvail(sem);
              const total = jpTotal(sem);
              const diff = avail - total;
              const pct = avail ? Math.min(100, (total / avail) * 100) : total ? 100 : 0;
              const isOver = total > avail;

              return (
                <div key={sem} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <span>Semester {sem}</span>
                    <span>
                      {total} JP materi dari {avail} JP efektif
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOver ? 'bg-amber-600 dark:bg-amber-500' : 'bg-emerald-700 dark:bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0">
                    {diff >= 0
                      ? `Sisa ${diff} JP untuk asesmen, remedial, dan cadangan.`
                      : `Kelebihan ${-diff} JP. Kurangi materi atau tambah minggu efektif.`}
                  </p>
                </div>
              );
            })}
          </section>

          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Kemajuan Berkas</h2>
            <div className="flex flex-col gap-1">
              {TABS.slice(1).map(t => {
                const st = getStatus(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => onTabSelect(t.id)}
                    className="flex items-center gap-3 w-full text-left py-2 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-t border-slate-100 dark:border-slate-800 first:border-0"
                  >
                    <span
                      className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                        st === 2
                          ? 'bg-emerald-700 border-emerald-700 text-white dark:bg-emerald-500 dark:text-slate-950'
                          : st === 1
                          ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300'
                          : 'border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {t.n}
                    </span>
                    <div className="flex flex-col flex-1 min-w-0">
                      <b className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.l}</b>
                      <small className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {getDetail(t.id)}
                      </small>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                        st === 2
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : st === 1
                          ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {STL[st]}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Cadangan Data / Backup */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Cadangan Data</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 m-0">
          Data tersimpan otomatis di peramban ini. Salin cadangan secara berkala, atau untuk memindahkan data ke perangkat lain: tempel cadangan ke kotak di bawah lalu pulihkan.
        </p>
        <textarea
          className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-xs text-slate-900 dark:text-slate-100 resize-y"
          value={backupText}
          onChange={e => setBackupText(e.target.value)}
          aria-label="Cadangan data"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCopyBackup}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-300 dark:border-slate-700"
          >
            Salin Cadangan
          </button>
          <button
            onClick={() => {
              onRestore(backupText);
            }}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-300 dark:border-slate-700"
          >
            Pulihkan dari Kotak
          </button>
        </div>
      </section>
    </div>
  );
};
