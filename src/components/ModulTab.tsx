import React from 'react';
import { AppState, UnitItem, TpItem } from '../types';
import { DocHeader } from './DocHeader';
import { DIMENSIONS } from '../data/defaultData';

interface ModulTabProps {
  state: AppState;
  isDocView: boolean;
  onToggleView: (v: 'edit' | 'doc') => void;
  onCopyDoc: () => void;
  onSelectUnit: (unitId: string) => void;
  onChangeModul: (unitId: string, field: string, val: any) => void;
  onToggleDimensi: (unitId: string, dim: string) => void;
  onGenModul: (unitId: string) => void;
  onTabSelect: (tabId: string) => void;
}

export const ModulTab: React.FC<ModulTabProps> = ({
  state,
  isDocView,
  onToggleView,
  onCopyDoc,
  onSelectUnit,
  onChangeModul,
  onToggleDimensi,
  onGenModul,
  onTabSelect
}) => {
  const p = state.profil;
  const dots = (s?: string) => (s ? s : '…………………');

  if (state.unit.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <DocHeader
          title="Modul Ajar"
          lead="Satu modul untuk setiap unit pembelajaran."
          tab="modul"
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

  let currentUnit = state.unit.find(u => u.id === state.ui.unit);
  if (!currentUnit) {
    currentUnit = state.unit[0];
  }
  const uId = currentUnit.id;
  const modulData = state.modul[uId] || {};

  const unitTps = state.tp.filter(t => t.unitId === uId);
  const unitJp = unitTps.reduce((a, t) => a + (Number(t.jp) || 0), 0);

  const MODUL_FIELDS = [
    { g: 'A. Informasi Umum' },
    { k: 'awal', l: 'Kompetensi awal', h: 3 },
    { k: 'dimensi', l: 'Dimensi Profil Lulusan' },
    { k: 'sarana', l: 'Sarana dan prasarana', h: 2 },
    { k: 'target', l: 'Target peserta didik', h: 2 },
    { k: 'model', l: 'Model dan pendekatan pembelajaran', h: 2 },
    { g: 'B. Komponen Inti' },
    { k: 'pemahaman', l: 'Pemahaman bermakna', h: 3 },
    { k: 'pemantik', l: 'Pertanyaan pemantik', h: 3 },
    { k: 'pendahuluan', l: 'Kegiatan pendahuluan', h: 5 },
    { k: 'memahami', l: 'Kegiatan inti: memahami', h: 4 },
    { k: 'mengaplikasi', l: 'Kegiatan inti: mengaplikasi', h: 4 },
    { k: 'merefleksi', l: 'Kegiatan inti: merefleksi', h: 4 },
    { k: 'penutup', l: 'Kegiatan penutup', h: 4 },
    { g: 'C. Asesmen dan Tindak Lanjut' },
    { k: 'diagnostik', l: 'Asesmen diagnostik', h: 2 },
    { k: 'formatif', l: 'Asesmen formatif', h: 3 },
    { k: 'sumatif', l: 'Asesmen sumatif', h: 3 },
    { k: 'remedial', l: 'Remedial', h: 3 },
    { k: 'pengayaan', l: 'Pengayaan', h: 3 },
    { g: 'D. Refleksi dan Pustaka' },
    { k: 'refGuru', l: 'Refleksi guru', h: 4 },
    { k: 'refSiswa', l: 'Refleksi peserta didik', h: 4 },
    { k: 'pustaka', l: 'Daftar pustaka', h: 2 }
  ];

  const nl = (s?: string) =>
    String(s || '')
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map((l, i) => <p key={i} className="mb-1">{l}</p>);

  const lv = [
    ['Perlu Bimbingan', `0–${Number(p.b1) || 60}`],
    ['Cukup', `${(Number(p.b1) || 60) + 1}–${Number(p.b2) || 75}`],
    ['Baik', `${(Number(p.b2) || 75) + 1}–${Number(p.b3) || 90}`],
    ['Sangat Baik', `${(Number(p.b3) || 90) + 1}–100`]
  ];

  const renderEdit = () => (
    <div className="flex flex-col gap-6">
      {/* Unit picker & generator */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex flex-wrap gap-2">
          {state.unit.map((u, i) => (
            <button
              key={u.id}
              onClick={() => onSelectUnit(u.id)}
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
          onClick={() => onGenModul(uId)}
          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium transition-colors"
        >
          Isi Kerangka Modul
        </button>
      </div>

      {/* Module form */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col gap-4">
        {MODUL_FIELDS.map((f, i) => {
          if (f.g) {
            return (
              <h3
                key={i}
                className="text-base font-bold text-slate-900 dark:text-slate-100 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 first:mt-0 first:pt-0 first:border-0"
              >
                {f.g}
              </h3>
            );
          }
          if (!f.k) return null;
          if (f.k === 'dimensi') {
            const curDim = modulData.dimensi || [];
            return (
              <div key={f.k} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{f.l}</span>
                <div className="flex flex-wrap gap-1.5">
                  {DIMENSIONS.map(d => {
                    const active = curDim.includes(d);
                    return (
                      <button
                        key={d}
                        onClick={() => onToggleDimensi(uId, d)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          active
                            ? 'bg-emerald-700 border-emerald-700 text-white'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }
          return (
            <label key={f.k} className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              {f.l}
              <textarea
                rows={f.h || 3}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm resize-y"
                value={(modulData as any)[f.k] || ''}
                onChange={e => onChangeModul(uId, f.k!, e.target.value)}
              />
            </label>
          );
        })}
      </section>
    </div>
  );

  const renderDoc = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        {state.unit.map((u, i) => (
          <button
            key={u.id}
            onClick={() => onSelectUnit(u.id)}
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
            Modul Ajar
          </h2>
          <p className="text-center text-xs text-slate-600 m-0">
            {currentUnit.nama} · Semester {currentUnit.sem} · Tahun Pelajaran {dots(p.ta)}
          </p>

          <table className="w-full text-xs font-serif border-collapse mb-4">
            <tbody>
              <tr>
                <td className="py-1 pr-2 w-36">Satuan Pendidikan</td>
                <td className="py-1">: {dots(p.sekolah)}</td>
                <td className="py-1 pr-2 w-32">Fase / Kelas</td>
                <td className="py-1">: {dots(p.fase)} / {dots(p.kelas)}</td>
              </tr>
              <tr>
                <td className="py-1 pr-2">Mata Pelajaran</td>
                <td className="py-1">: {dots(p.mapel)}</td>
                <td className="py-1 pr-2">Alokasi Waktu</td>
                <td className="py-1">: {unitJp} JP × {Number(p.menit) || 40} menit</td>
              </tr>
              <tr>
                <td className="py-1 pr-2">Nama Guru</td>
                <td className="py-1">: {dots(p.guru)}</td>
                <td className="py-1 pr-2">Tahun Pelajaran</td>
                <td className="py-1">: {dots(p.ta)}</td>
              </tr>
            </tbody>
          </table>

          {/* A. Informasi Umum */}
          <h3 className="font-bold text-xs uppercase tracking-wide mt-4 mb-1">A. Informasi Umum</h3>
          {modulData.awal && (
            <div>
              <h4 className="font-bold text-xs mt-2 mb-1">Kompetensi Awal</h4>
              {nl(modulData.awal)}
            </div>
          )}
          {modulData.dimensi && modulData.dimensi.length > 0 && (
            <div>
              <h4 className="font-bold text-xs mt-2 mb-1">Dimensi Profil Lulusan</h4>
              <ul className="list-disc pl-5 m-0">
                {modulData.dimensi.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}
          {modulData.sarana && (
            <div>
              <h4 className="font-bold text-xs mt-2 mb-1">Sarana dan Prasarana</h4>
              {nl(modulData.sarana)}
            </div>
          )}
          {modulData.target && (
            <div>
              <h4 className="font-bold text-xs mt-2 mb-1">Target Peserta Didik</h4>
              {nl(modulData.target)}
            </div>
          )}
          {modulData.model && (
            <div>
              <h4 className="font-bold text-xs mt-2 mb-1">Model dan Pendekatan Pembelajaran</h4>
              {nl(modulData.model)}
            </div>
          )}

          {/* B. Komponen Inti */}
          <h3 className="font-bold text-xs uppercase tracking-wide mt-4 mb-1">B. Komponen Inti</h3>
          <div>
            <h4 className="font-bold text-xs mt-2 mb-1">Tujuan Pembelajaran</h4>
            <ul className="list-decimal pl-5 m-0">
              {unitTps.map((t, i) => (
                <li key={t.id} className="mb-1">{t.teks}</li>
              ))}
            </ul>
          </div>
          {modulData.pemahaman && (
            <div>
              <h4 className="font-bold text-xs mt-2 mb-1">Pemahaman Bermakna</h4>
              {nl(modulData.pemahaman)}
            </div>
          )}
          {modulData.pemantik && (
            <div>
              <h4 className="font-bold text-xs mt-2 mb-1">Pertanyaan Pemantik</h4>
              {nl(modulData.pemantik)}
            </div>
          )}
          <div>
            <h4 className="font-bold text-xs mt-2 mb-1">Kegiatan Pembelajaran</h4>
            {modulData.pendahuluan && (
              <div className="mb-2">
                <p className="font-semibold text-xs italic m-0">Pendahuluan</p>
                {nl(modulData.pendahuluan)}
              </div>
            )}
            {modulData.memahami && (
              <div className="mb-2">
                <p className="font-semibold text-xs italic m-0">Inti — Memahami</p>
                {nl(modulData.memahami)}
              </div>
            )}
            {modulData.mengaplikasi && (
              <div className="mb-2">
                <p className="font-semibold text-xs italic m-0">Inti — Mengaplikasi</p>
                {nl(modulData.mengaplikasi)}
              </div>
            )}
            {modulData.merefleksi && (
              <div className="mb-2">
                <p className="font-semibold text-xs italic m-0">Inti — Merefleksi</p>
                {nl(modulData.merefleksi)}
              </div>
            )}
            {modulData.penutup && (
              <div className="mb-2">
                <p className="font-semibold text-xs italic m-0">Penutup</p>
                {nl(modulData.penutup)}
              </div>
            )}
          </div>

          {/* C. Asesmen */}
          <h3 className="font-bold text-xs uppercase tracking-wide mt-4 mb-1">
            C. Asesmen dan Tindak Lanjut
          </h3>
          {modulData.diagnostik && (
            <div>
              <h4 className="font-bold text-xs mt-2 mb-1">Asesmen Diagnostik</h4>
              {nl(modulData.diagnostik)}
            </div>
          )}
          {modulData.formatif && (
            <div>
              <h4 className="font-bold text-xs mt-2 mb-1">Asesmen Formatif</h4>
              {nl(modulData.formatif)}
            </div>
          )}
          {modulData.sumatif && (
            <div>
              <h4 className="font-bold text-xs mt-2 mb-1">Asesmen Sumatif</h4>
              {nl(modulData.sumatif)}
            </div>
          )}

          <div>
            <h4 className="font-bold text-xs mt-2 mb-1">Kriteria Ketercapaian (KKTP)</h4>
            <table className="w-full border-collapse border border-slate-800 text-[11px] font-serif">
              <thead>
                <tr className="bg-emerald-50">
                  <th className="border border-slate-800 p-1 text-left">Tujuan Pembelajaran</th>
                  {lv.map((l, i) => (
                    <th key={i} className="border border-slate-800 p-1 text-center w-24">
                      {l[0]}<br />({l[1]})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {unitTps.map(t => (
                  <tr key={t.id}>
                    <td className="border border-slate-800 p-1">{t.teks}</td>
                    <td className="border border-slate-800 p-1 text-[10px]">{t.r1}</td>
                    <td className="border border-slate-800 p-1 text-[10px]">{t.r2}</td>
                    <td className="border border-slate-800 p-1 text-[10px]">{t.r3}</td>
                    <td className="border border-slate-800 p-1 text-[10px]">{t.r4}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {modulData.remedial && (
            <div>
              <h4 className="font-bold text-xs mt-2 mb-1">Remedial</h4>
              {nl(modulData.remedial)}
            </div>
          )}
          {modulData.pengayaan && (
            <div>
              <h4 className="font-bold text-xs mt-2 mb-1">Pengayaan</h4>
              {nl(modulData.pengayaan)}
            </div>
          )}

          {/* D. Refleksi & Pustaka */}
          <h3 className="font-bold text-xs uppercase tracking-wide mt-4 mb-1">
            D. Refleksi dan Lampiran
          </h3>
          {modulData.refGuru && (
            <div>
              <h4 className="font-bold text-xs mt-2 mb-1">Refleksi Guru</h4>
              {nl(modulData.refGuru)}
            </div>
          )}
          {modulData.refSiswa && (
            <div>
              <h4 className="font-bold text-xs mt-2 mb-1">Refleksi Peserta Didik</h4>
              {nl(modulData.refSiswa)}
            </div>
          )}
          {modulData.pustaka && (
            <div>
              <h4 className="font-bold text-xs mt-2 mb-1">Daftar Pustaka</h4>
              {nl(modulData.pustaka)}
            </div>
          )}

          <div>
            <h4 className="font-bold text-xs mt-2 mb-1">Lampiran</h4>
            <p className="m-0">
              LKPD: {state.lkpd[uId]?.judul || `LKPD ${currentUnit.nama}`}
            </p>
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

  return (
    <div className="flex flex-col gap-6">
      <DocHeader
        title="Modul Ajar"
        lead="Satu modul untuk setiap unit. Identitas, tujuan pembelajaran, alokasi waktu, dan rubrik KKTP diambil otomatis; bagian lain dapat dibuat dari kerangka lalu disesuaikan."
        tab="modul"
        isDocView={isDocView}
        onToggleView={onToggleView}
        onCopy={onCopyDoc}
      />
      {isDocView ? renderDoc() : renderEdit()}
    </div>
  );
};
