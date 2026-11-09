import React from 'react';
import { AppState, Semester, TpItem } from '../types';
import { DocHeader } from './DocHeader';

interface KktpTabProps {
  state: AppState;
  isDocView: boolean;
  onToggleView: (v: 'edit' | 'doc') => void;
  onCopyDoc: () => void;
  onChangeProfile: (key: string, val: any) => void;
  onChangeTp: (id: string, field: string, val: any) => void;
  onGenKktp: (id: string) => void;
  onGenAllKktp: () => void;
  onTabSelect: (tabId: string) => void;
}

export const KktpTab: React.FC<KktpTabProps> = ({
  state,
  isDocView,
  onToggleView,
  onCopyDoc,
  onChangeProfile,
  onChangeTp,
  onGenKktp,
  onGenAllKktp,
  onTabSelect
}) => {
  const p = state.profil;
  const dots = (s?: string) => (s ? s : '…………………');

  const orderedTps = [1, 2].flatMap(s => {
    const us = state.unit.filter(u => u.sem === (s as Semester));
    return us.flatMap(u => state.tp.filter(t => t.unitId === u.id));
  });

  // Compute number map for TPs
  const NOMAP: Record<string, number> = {};
  let count = 0;
  [1, 2].forEach(s => {
    state.unit
      .filter(u => u.sem === s)
      .forEach(u => {
        state.tp
          .filter(t => t.unitId === u.id)
          .forEach(t => {
            count++;
            NOMAP[t.id] = count;
          });
      });
  });
  const getNo = (id: string) => NOMAP[id] || '–';

  const b1 = Number(p.b1) || 60;
  const b2 = Number(p.b2) || 75;
  const b3 = Number(p.b3) || 90;

  const lv = [
    ['Perlu Bimbingan', `0–${b1}`],
    ['Cukup', `${b1 + 1}–${b2}`],
    ['Baik', `${b2 + 1}–${b3}`],
    ['Sangat Baik', `${b3 + 1}–100`]
  ];

  if (orderedTps.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <DocHeader
          title="KKTP"
          lead="Kriteria ketercapaian untuk setiap tujuan pembelajaran, dalam bentuk rubrik empat tingkat."
          tab="kktp"
          isDocView={isDocView}
          onToggleView={onToggleView}
          onCopy={onCopyDoc}
        />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center flex flex-col items-center gap-4">
          <p className="text-slate-600 dark:text-slate-400 m-0">
            Belum ada tujuan pembelajaran. KKTP disusun untuk setiap TP.
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

  const renderEdit = () => (
    <div className="flex flex-col gap-6">
      {/* Interval values */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Interval Nilai</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Batas atas tiap tingkat. Tingkat Sangat Baik berakhir di 100.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 w-32 text-xs font-medium text-slate-600 dark:text-slate-400">
            Perlu Bb s.d.
            <input
              type="number"
              min="0"
              max="99"
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
              value={p.b1}
              onChange={e => onChangeProfile('b1', Number(e.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1 w-32 text-xs font-medium text-slate-600 dark:text-slate-400">
            Cukup s.d.
            <input
              type="number"
              min="0"
              max="99"
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
              value={p.b2}
              onChange={e => onChangeProfile('b2', Number(e.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1 w-32 text-xs font-medium text-slate-600 dark:text-slate-400">
            Baik s.d.
            <input
              type="number"
              min="0"
              max="99"
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
              value={p.b3}
              onChange={e => onChangeProfile('b3', Number(e.target.value))}
            />
          </label>
          <button
            onClick={onGenAllKktp}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium transition-colors ml-auto"
          >
            Isi Kerangka Semua TP yang Kosong
          </button>
        </div>
      </section>

      {/* TPs KKTP Cards */}
      <div className="flex flex-col gap-4">
        {orderedTps.map(t => {
          const u = state.unit.find(x => x.id === t.unitId);
          return (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col gap-4"
            >
              <div className="flex flex-wrap items-center gap-3">
                <b className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  TP {getNo(t.id)}
                </b>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {u ? u.nama : ''}
                </span>
                <button
                  onClick={() => onGenKktp(t.id)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-md text-xs font-medium border border-slate-300 dark:border-slate-700 ml-auto"
                >
                  Isi Kerangka
                </button>
              </div>

              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 m-0">{t.teks}</p>

              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                Kriteria ketercapaian
                <textarea
                  rows={2}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm resize-y"
                  value={t.ind}
                  onChange={e => onChangeTp(t.id, 'ind', e.target.value)}
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                  {lv[0][0]} ({lv[0][1]})
                  <textarea
                    rows={2}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs resize-y"
                    value={t.r1}
                    onChange={e => onChangeTp(t.id, 'r1', e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                  {lv[1][0]} ({lv[1][1]})
                  <textarea
                    rows={2}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs resize-y"
                    value={t.r2}
                    onChange={e => onChangeTp(t.id, 'r2', e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                  {lv[2][0]} ({lv[2][1]})
                  <textarea
                    rows={2}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs resize-y"
                    value={t.r3}
                    onChange={e => onChangeTp(t.id, 'r3', e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                  {lv[3][0]} ({lv[3][1]})
                  <textarea
                    rows={2}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs resize-y"
                    value={t.r4}
                    onChange={e => onChangeTp(t.id, 'r4', e.target.value)}
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                Teknik asesmen
                <input
                  type="text"
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
                  value={t.teknik}
                  onChange={e => onChangeTp(t.id, 'teknik', e.target.value)}
                />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDoc = () => (
    <div className="bg-white border border-slate-300 rounded-xl overflow-x-auto shadow-md">
      <article className="p-8 text-slate-900 font-serif text-sm leading-relaxed min-w-[900px] space-y-6">
        <h2 className="text-center font-bold text-base uppercase tracking-wider m-0">
          Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)
        </h2>
        <p className="text-center text-xs text-slate-600 m-0">
          Tahun Pelajaran {dots(p.ta)}
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
              <td className="py-1 pr-2">Tahun Pelajaran</td>
              <td className="py-1">: {dots(p.ta)}</td>
            </tr>
            <tr>
              <td className="py-1 pr-2">Nama Guru</td>
              <td className="py-1">: {dots(p.guru)}</td>
              <td className="py-1 pr-2">Alokasi per minggu</td>
              <td className="py-1">: {Number(p.jp) || 4} JP</td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border-collapse border border-slate-800 text-xs font-serif">
          <thead>
            <tr className="bg-emerald-50">
              <th className="border border-slate-800 p-2 text-center w-10" rowSpan={2}>
                No
              </th>
              <th className="border border-slate-800 p-2 text-left" rowSpan={2}>
                Tujuan Pembelajaran
              </th>
              <th className="border border-slate-800 p-2 text-left" rowSpan={2}>
                Kriteria Ketercapaian
              </th>
              <th className="border border-slate-800 p-2 text-center" colSpan={4}>
                Rubrik / Interval Nilai
              </th>
              <th className="border border-slate-800 p-2 text-left w-32" rowSpan={2}>
                Teknik Asesmen
              </th>
            </tr>
            <tr className="bg-emerald-50/80">
              {lv.map((l, i) => (
                <th key={i} className="border border-slate-800 p-1 text-center text-[11px] w-28">
                  {l[0]}<br />({l[1]})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orderedTps.map(t => (
              <tr key={t.id}>
                <td className="border border-slate-800 p-2 text-center align-top">{getNo(t.id)}</td>
                <td className="border border-slate-800 p-2 align-top">{t.teks}</td>
                <td className="border border-slate-800 p-2 align-top">{t.ind}</td>
                <td className="border border-slate-800 p-2 align-top text-[11px]">{t.r1}</td>
                <td className="border border-slate-800 p-2 align-top text-[11px]">{t.r2}</td>
                <td className="border border-slate-800 p-2 align-top text-[11px]">{t.r3}</td>
                <td className="border border-slate-800 p-2 align-top text-[11px]">{t.r4}</td>
                <td className="border border-slate-800 p-2 align-top">{t.teknik}</td>
              </tr>
            ))}
          </tbody>
        </table>

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
  );

  return (
    <div className="flex flex-col gap-6">
      <DocHeader
        title="KKTP"
        lead="Kriteria ketercapaian untuk setiap tujuan pembelajaran, dalam bentuk rubrik empat tingkat. Tujuan pembelajaran diambil dari CP–ATP."
        tab="kktp"
        isDocView={isDocView}
        onToggleView={onToggleView}
        onCopy={onCopyDoc}
      />
      {isDocView ? renderDoc() : renderEdit()}
    </div>
  );
};
