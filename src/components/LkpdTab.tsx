import React from 'react';
import { AppState } from '../types';
import { DocHeader } from './DocHeader';

interface LkpdTabProps {
  state: AppState;
  isDocView: boolean;
  onToggleView: (v: 'edit' | 'doc') => void;
  onCopyDoc: () => void;
  onSelectUnitL: (unitId: string) => void;
  onChangeLkpd: (unitId: string, field: string, val: any) => void;
  onGenLkpd: (unitId: string) => void;
  onTabSelect: (tabId: string) => void;
}

export const LkpdTab: React.FC<LkpdTabProps> = ({
  state,
  isDocView,
  onToggleView,
  onCopyDoc,
  onSelectUnitL,
  onChangeLkpd,
  onGenLkpd,
  onTabSelect
}) => {
  const p = state.profil;
  const dots = (s?: string) => (s ? s : '…………………');

  if (state.unit.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <DocHeader
          title="LKPD"
          lead="Lembar kerja peserta didik per unit."
          tab="lkpd"
          isDocView={isDocView}
          onToggleView={onToggleView}
          onCopy={onCopyDoc}
        />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center flex flex-col items-center gap-4">
          <p className="text-slate-600 dark:text-slate-400 m-0">
            Belum ada unit. Susun alur tujuan pembelajaran di CP–ATP terlebih dahulu.
          </p>
          <button
            onClick={() => onTabSelect('cpatp')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Buka CP–ATP
          </button>
        </div>
      </div>
    );
  }

  let currentUnit = state.unit.find(u => u.id === state.ui.unitL);
  if (!currentUnit) {
    currentUnit = state.unit[0];
  }
  const uId = currentUnit.id;
  const lkpdData = state.lkpd[uId] || {};

  const unitTps = state.tp.filter(t => t.unitId === uId);

  const LKPD_FIELDS = [
    { k: 'judul', l: 'Judul LKPD', t: 'in' },
    { k: 'petunjuk', l: 'Petunjuk belajar', h: 5 },
    { k: 'tujuan', l: 'Tujuan pembelajaran', h: 3 },
    { k: 'alat', l: 'Alat dan bahan', h: 2 },
    { k: 'kegiatan', l: 'Langkah kegiatan', h: 4 },
    { k: 'tugas', l: 'Tugas (satu baris untuk satu tugas)', h: 6 },
    { k: 'baris', l: 'Baris jawaban per tugas', t: 'num' },
    { k: 'kesimpulan', l: 'Pertanyaan kesimpulan', h: 2 },
    { k: 'refleksi', l: 'Pengantar refleksi', h: 2 }
  ];

  const nl = (s?: string) =>
    String(s || '')
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map((l, i) => <p key={i} className="mb-1">{l}</p>);

  const lines = (s?: string) =>
    String(s || '')
      .split('\n')
      .map(x => x.trim())
      .filter(Boolean);

  const lv = [
    ['Perlu Bimbingan', `0–${Number(p.b1) || 60}`],
    ['Cukup', `${(Number(p.b1) || 60) + 1}–${Number(p.b2) || 75}`],
    ['Baik', `${(Number(p.b2) || 75) + 1}–${Number(p.b3) || 90}`],
    ['Sangat Baik', `${(Number(p.b3) || 90) + 1}–100`]
  ];

  const renderEdit = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex flex-wrap gap-2">
          {state.unit.map((u, i) => (
            <button
              key={u.id}
              onClick={() => onSelectUnitL(u.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                u.id === uId
                  ? 'bg-emerald-700 border-emerald-700 text-white'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {u.nama || `Unit ${i + 1}`} <span className="opacity-75 ml-1">S{u.sem}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => onGenLkpd(uId)}
          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium transition-colors"
        >
          Isi Kerangka LKPD
        </button>
      </div>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col gap-4">
        {LKPD_FIELDS.map(f => {
          if (f.t === 'in') {
            return (
              <label key={f.k} className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                {f.l}
                <input
                  type="text"
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
                  value={(lkpdData as any)[f.k] || ''}
                  onChange={e => onChangeLkpd(uId, f.k, e.target.value)}
                />
              </label>
            );
          }
          if (f.t === 'num') {
            return (
              <label key={f.k} className="flex flex-col gap-1 w-40 text-xs font-medium text-slate-600 dark:text-slate-400">
                {f.l}
                <input
                  type="number"
                  min="1"
                  max="12"
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
                  value={(lkpdData as any)[f.k] || 3}
                  onChange={e => onChangeLkpd(uId, f.k, Number(e.target.value))}
                />
              </label>
            );
          }
          return (
            <label key={f.k} className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              {f.l}
              <textarea
                rows={f.h || 3}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm resize-y"
                value={(lkpdData as any)[f.k] || ''}
                onChange={e => onChangeLkpd(uId, f.k, e.target.value)}
              />
            </label>
          );
        })}
      </section>
    </div>
  );

  const renderDoc = () => {
    const rowCount = Math.max(1, Number(lkpdData.baris) || 3);
    const taskList = lines(lkpdData.tugas);

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          {state.unit.map((u, i) => (
            <button
              key={u.id}
              onClick={() => onSelectUnitL(u.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                u.id === uId
                  ? 'bg-emerald-700 border-emerald-700 text-white'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {u.nama || `Unit ${i + 1}`} <span className="opacity-75 ml-1">S{u.sem}</span>
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-md">
          <article className="p-8 text-slate-900 font-serif text-sm leading-relaxed max-w-4xl mx-auto space-y-6">
            <h2 className="text-center font-bold text-base uppercase tracking-wider m-0">
              Lembar Kerja Peserta Didik (LKPD)
            </h2>
            <p className="text-center text-xs text-slate-600 m-0">
              {lkpdData.judul || `LKPD ${currentUnit.nama}`} · Tahun Pelajaran {dots(p.ta)}
            </p>

            <table className="w-full text-xs font-serif border-collapse mb-4 border border-slate-800">
              <tbody>
                <tr>
                  <td className="p-2 border border-slate-800 w-36 font-medium">Nama Kelompok</td>
                  <td className="p-2 border border-slate-800"></td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-800 font-medium">Anggota</td>
                  <td className="p-2 border border-slate-800 h-16"></td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-800 font-medium">Kelas / Tanggal</td>
                  <td className="p-2 border border-slate-800"></td>
                </tr>
              </tbody>
            </table>

            {lkpdData.tujuan && (
              <div>
                <h4 className="font-bold text-xs mt-3 mb-1">Tujuan Pembelajaran</h4>
                {nl(lkpdData.tujuan)}
              </div>
            )}
            {lkpdData.petunjuk && (
              <div>
                <h4 className="font-bold text-xs mt-3 mb-1">Petunjuk Belajar</h4>
                {nl(lkpdData.petunjuk)}
              </div>
            )}
            {lkpdData.alat && (
              <div>
                <h4 className="font-bold text-xs mt-3 mb-1">Alat dan Bahan</h4>
                {nl(lkpdData.alat)}
              </div>
            )}
            {lkpdData.kegiatan && (
              <div>
                <h4 className="font-bold text-xs mt-3 mb-1">Langkah Kegiatan</h4>
                {nl(lkpdData.kegiatan)}
              </div>
            )}

            <div>
              <h4 className="font-bold text-xs mt-3 mb-1">Tugas</h4>
              {taskList.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Belum ada tugas.</p>
              ) : (
                taskList.map((t, idx) => (
                  <div key={idx} className="mb-4">
                    <p className="font-semibold text-xs mb-1">{t}</p>
                    {Array.from({ length: rowCount }).map((_, rIdx) => (
                      <div key={rIdx} className="border-b border-slate-400 h-6 mb-1" />
                    ))}
                  </div>
                ))
              )}
            </div>

            {lkpdData.kesimpulan && (
              <div>
                <h4 className="font-bold text-xs mt-3 mb-1">Kesimpulan</h4>
                <p className="mb-2">{lkpdData.kesimpulan}</p>
                {Array.from({ length: Math.min(rowCount, 3) }).map((_, rIdx) => (
                  <div key={rIdx} className="border-b border-slate-400 h-6 mb-1" />
                ))}
              </div>
            )}

            {lkpdData.refleksi && (
              <div>
                <h4 className="font-bold text-xs mt-3 mb-1">Refleksi</h4>
                <p className="mb-2">{lkpdData.refleksi}</p>
                <div className="flex items-center gap-6 text-xs font-sans mt-2">
                  <label className="flex items-center gap-1.5">
                    <span className="w-4 h-4 border border-slate-800 inline-block" /> Aku sudah paham
                  </label>
                  <label className="flex items-center gap-1.5">
                    <span className="w-4 h-4 border border-slate-800 inline-block" /> Aku masih perlu latihan
                  </label>
                  <label className="flex items-center gap-1.5">
                    <span className="w-4 h-4 border border-slate-800 inline-block" /> Aku belum paham
                  </label>
                </div>
              </div>
            )}

            <div className="pt-2">
              <h4 className="font-bold text-xs mt-3 mb-1">Penilaian Guru</h4>
              <div className="flex flex-wrap gap-4 text-xs font-sans">
                {lv.map((l, i) => (
                  <label key={i} className="flex items-center gap-1.5">
                    {l[0]} ({l[1]}) <span className="w-4 h-4 border border-slate-800 inline-block" />
                  </label>
                ))}
              </div>
            </div>

            <table className="w-full border-collapse mt-8 text-xs font-serif">
              <tbody>
                <tr>
                  <td className="w-1/2 align-top">
                    Mengetahui,<br />
                    Kepala Sekolah<br /><br /><br /><br />
                    <b><u>{dots(p.kepsek)}</u></b><br />
                    NIP. {p.nipKs || '…………………'}
                  </td>
                  <td className="w-1/2 align-top text-right">
                    {p.kota || '…………'}, {p.tgl || '…………………'}<br />
                    Guru Mata Pelajaran<br /><br /><br /><br />
                    <b><u>{dots(p.guru)}</u></b><br />
                    NIP. {p.nip || '…………………'}
                  </td>
                </tr>
              </tbody>
            </table>
          </article>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <DocHeader
        title="LKPD"
        lead="Lembar kerja untuk setiap unit. Tujuan dan tugas diturunkan dari tujuan pembelajaran unit, lalu dapat Anda tulis ulang sesuai kegiatan kelas."
        tab="lkpd"
        isDocView={isDocView}
        onToggleView={onToggleView}
        onCopy={onCopyDoc}
      />
      {isDocView ? renderDoc() : renderEdit()}
    </div>
  );
};
