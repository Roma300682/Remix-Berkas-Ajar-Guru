/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AppState, Semester, UnitItem, TpItem } from './types';
import { blankState, seedSampleData, uid, genKktp, genModul, genLkpd } from './data/defaultData';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { BerandaTab } from './components/BerandaTab';
import { WaktuTab } from './components/WaktuTab';
import { CpatpTab } from './components/CpatpTab';
import { ProtaTab } from './components/ProtaTab';
import { PromesTab } from './components/PromesTab';
import { KktpTab } from './components/KktpTab';
import { ModulTab } from './components/ModulTab';
import { LkpdTab } from './components/LkpdTab';

const KEY = 'berkas-ajar-guru-v1';

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.profil && parsed.bulan && parsed.tp && parsed.unit) {
          return parsed;
        }
      }
    } catch (e) {}
    const seeded = seedSampleData();
    return seeded;
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3200);
  }, []);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [state]);

  const handleTabSelect = (tabId: string) => {
    setState(prev => ({
      ...prev,
      ui: { ...prev.ui, tab: tabId }
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleView = (v: 'edit' | 'doc') => {
    const tab = state.ui.tab;
    setState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        doc: { ...prev.ui.doc, [tab]: v === 'doc' }
      }
    }));
  };

  const handleChangeProfile = (key: string, value: any) => {
    setState(prev => ({
      ...prev,
      profil: { ...prev.profil, [key]: value }
    }));
  };

  const handleKeepSample = () => {
    setState(prev => ({ ...prev, sample: false }));
    showToast('Mode contoh dimatikan. Data siap Anda sesuaikan.');
  };

  const handleResetAll = () => {
    const fresh = blankState();
    setState(fresh);
    showToast('Data dikosongkan.');
  };

  const handleRestore = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || !parsed.profil || !parsed.bulan || !parsed.tp || !parsed.unit) {
        throw new Error('Format tidak valid');
      }
      setState(parsed);
      showToast('Data berhasil dipulihkan dari cadangan.');
    } catch (e) {
      showToast('Cadangan tidak valid. Tempel isi cadangan yang utuh.');
    }
  };

  // Analisis Waktu handlers
  const handleChangeMonth = (id: string, field: string, val: any) => {
    setState(prev => ({
      ...prev,
      bulan: prev.bulan.map(b => {
        if (b.id !== id) return b;
        let update = { ...b, [field]: val };
        if (field === 'n') {
          const n = Math.max(1, Math.min(6, Math.round(Number(val) || 1)));
          update.n = n;
          update.off = update.off.filter(i => i < n);
        }
        return update;
      })
    }));
  };

  const handleToggleWeekOff = (monthId: string, weekIdx: number) => {
    setState(prev => ({
      ...prev,
      bulan: prev.bulan.map(b => {
        if (b.id !== monthId) return b;
        const off = [...b.off];
        const idx = off.indexOf(weekIdx);
        if (idx >= 0) off.splice(idx, 1);
        else off.push(weekIdx);
        return { ...b, off };
      })
    }));
  };

  const handleAddMonth = (sem: Semester) => {
    setState(prev => ({
      ...prev,
      bulan: [...prev.bulan, { id: uid(), sem, nama: 'Bulan Baru', n: 4, off: [], ket: '' }]
    }));
  };

  const handleDeleteMonth = (id: string) => {
    setState(prev => ({
      ...prev,
      bulan: prev.bulan.filter(b => b.id !== id)
    }));
  };

  // CP & ATP handlers
  const handleChangeCp = (id: string, field: string, val: string) => {
    setState(prev => ({
      ...prev,
      cp: prev.cp.map(c => (c.id === id ? { ...c, [field]: val } : c))
    }));
  };

  const handleAddCp = () => {
    setState(prev => ({
      ...prev,
      cp: [...prev.cp, { id: uid(), elemen: '', teks: '' }]
    }));
  };

  const handleDeleteCp = (id: string) => {
    setState(prev => ({
      ...prev,
      cp: prev.cp.filter(c => c.id !== id),
      unit: prev.unit.map(u => (u.cpId === id ? { ...u, cpId: '' } : u))
    }));
  };

  const handleAddUnit = (sem: Semester) => {
    const newUnit: UnitItem = {
      id: uid(),
      sem,
      nama: 'Unit Materi Baru',
      cpId: state.cp[0] ? state.cp[0].id : ''
    };
    const newTp: TpItem = {
      id: uid(),
      unitId: newUnit.id,
      teks: 'Peserta didik dapat ',
      jp: 4,
      ind: '',
      r1: '',
      r2: '',
      r3: '',
      r4: '',
      teknik: ''
    };
    setState(prev => ({
      ...prev,
      unit: [...prev.unit, newUnit],
      tp: [...prev.tp, newTp]
    }));
  };

  const handleChangeUnit = (id: string, field: string, val: any) => {
    setState(prev => ({
      ...prev,
      unit: prev.unit.map(u => (u.id === id ? { ...u, [field]: val } : u))
    }));
  };

  const handleDeleteUnit = (id: string) => {
    const tpIds = state.tp.filter(t => t.unitId === id).map(t => t.id);
    setState(prev => {
      const newPromes = { ...prev.promes };
      tpIds.forEach(tId => delete newPromes[tId]);
      const newModul = { ...prev.modul };
      delete newModul[id];
      const newLkpd = { ...prev.lkpd };
      delete newLkpd[id];

      return {
        ...prev,
        unit: prev.unit.filter(u => u.id !== id),
        tp: prev.tp.filter(t => t.unitId !== id),
        promes: newPromes,
        modul: newModul,
        lkpd: newLkpd
      };
    });
  };

  const handleMoveUnit = (id: string, dir: number) => {
    const targetUnit = state.unit.find(u => u.id === id);
    if (!targetUnit) return;
    const sameSemUnits = state.unit.filter(u => u.sem === targetUnit.sem);
    const idx = sameSemUnits.findIndex(u => u.id === id);
    const newIdx = idx + dir;
    if (idx < 0 || newIdx < 0 || newIdx >= sameSemUnits.length) return;

    // Reorder in full unit array
    const copy = [...state.unit];
    const globalIdxA = copy.findIndex(u => u.id === sameSemUnits[idx].id);
    const globalIdxB = copy.findIndex(u => u.id === sameSemUnits[newIdx].id);
    const tmp = copy[globalIdxA];
    copy[globalIdxA] = copy[globalIdxB];
    copy[globalIdxB] = tmp;

    setState(prev => ({ ...prev, unit: copy }));
  };

  const handleChangeTp = (id: string, field: string, val: any) => {
    setState(prev => ({
      ...prev,
      tp: prev.tp.map(t => (t.id === id ? { ...t, [field]: val } : t))
    }));
  };

  const handleAddTp = (unitId: string) => {
    const newTp: TpItem = {
      id: uid(),
      unitId,
      teks: 'Peserta didik dapat ',
      jp: 4,
      ind: '',
      r1: '',
      r2: '',
      r3: '',
      r4: '',
      teknik: ''
    };
    setState(prev => ({
      ...prev,
      tp: [...prev.tp, newTp]
    }));
  };

  const handleDeleteTp = (id: string) => {
    setState(prev => {
      const newPromes = { ...prev.promes };
      delete newPromes[id];
      return {
        ...prev,
        tp: prev.tp.filter(t => t.id !== id),
        promes: newPromes
      };
    });
  };

  const handleMoveTp = (id: string, dir: number) => {
    const targetTp = state.tp.find(t => t.id === id);
    if (!targetTp) return;
    const unitTps = state.tp.filter(t => t.unitId === targetTp.unitId);
    const idx = unitTps.findIndex(t => t.id === id);
    const newIdx = idx + dir;
    if (idx < 0 || newIdx < 0 || newIdx >= unitTps.length) return;

    const copy = [...state.tp];
    const globalIdxA = copy.findIndex(t => t.id === unitTps[idx].id);
    const globalIdxB = copy.findIndex(t => t.id === unitTps[newIdx].id);
    const tmp = copy[globalIdxA];
    copy[globalIdxA] = copy[globalIdxB];
    copy[globalIdxB] = tmp;

    setState(prev => ({ ...prev, tp: copy }));
  };

  // Program Semester handlers
  const handleSemSelect = (sem: Semester) => {
    setState(prev => ({
      ...prev,
      ui: { ...prev.ui, sem }
    }));
  };

  const handleAutoSebar = (sem: Semester) => {
    const bs = state.bulan.filter(b => b.sem === sem);
    const sl: string[] = [];
    bs.forEach(b => {
      for (let w = 0; w < b.n; w++) {
        if (!b.off.includes(w)) sl.push(`${b.id}:${w}`);
      }
    });

    const jpWeek = Number(state.profil.jp) || 1;
    const uIds = state.unit.filter(u => u.sem === sem).map(u => u.id);
    const tps = state.tp.filter(t => uIds.includes(t.unitId));

    let cur = 0;
    let over = 0;
    const newPromes = { ...state.promes };

    tps.forEach(t => {
      const j = Number(t.jp) || 0;
      const set: string[] = [];
      if (j > 0) {
        const a = Math.floor(cur / jpWeek);
        const b = Math.ceil((cur + j) / jpWeek) - 1;
        for (let i = a; i <= b; i++) {
          if (sl[i]) set.push(sl[i]);
          else over++;
        }
      }
      newPromes[t.id] = set;
      cur += j;
    });

    setState(prev => ({ ...prev, promes: newPromes }));
    showToast(
      over
        ? 'Sebagian TP melebihi minggu efektif. Kurangi JP atau tambah minggu.'
        : 'Jadwal tersebar ke minggu efektif sesuai JP.'
    );
  };

  const handleClearPromes = (sem: Semester) => {
    const uIds = state.unit.filter(u => u.sem === sem).map(u => u.id);
    const tps = state.tp.filter(t => uIds.includes(t.unitId));
    const newPromes = { ...state.promes };
    tps.forEach(t => {
      newPromes[t.id] = [];
    });
    setState(prev => ({ ...prev, promes: newPromes }));
    showToast('Jadwal program semester dikosongkan.');
  };

  const handleToggleCell = (tpId: string, cellKey: string) => {
    setState(prev => {
      const set = [...(prev.promes[tpId] || [])];
      const pos = set.indexOf(cellKey);
      if (pos >= 0) set.splice(pos, 1);
      else set.push(cellKey);
      return {
        ...prev,
        promes: { ...prev.promes, [tpId]: set }
      };
    });
  };

  // KKTP handlers
  const handleGenKktp = (id: string) => {
    setState(prev => ({
      ...prev,
      tp: prev.tp.map(t => {
        if (t.id !== id) return t;
        const k = genKktp(t);
        return { ...t, ...k };
      })
    }));
    showToast('Kerangka KKTP terisi.');
  };

  const handleGenAllKktp = () => {
    setState(prev => ({
      ...prev,
      tp: prev.tp.map(t => {
        if (!t.ind || !t.r1) {
          const k = genKktp(t);
          return { ...t, ...k };
        }
        return t;
      })
    }));
    showToast('Kerangka KKTP terisi untuk bagian yang kosong.');
  };

  // Modul Ajar handlers
  const handleSelectUnit = (unitId: string) => {
    setState(prev => ({
      ...prev,
      ui: { ...prev.ui, unit: unitId }
    }));
  };

  const handleChangeModul = (unitId: string, field: string, val: any) => {
    setState(prev => {
      const m = { ...(prev.modul[unitId] || {}), [field]: val };
      return {
        ...prev,
        modul: { ...prev.modul, [unitId]: m }
      };
    });
  };

  const handleToggleDimensi = (unitId: string, dim: string) => {
    setState(prev => {
      const m = { ...(prev.modul[unitId] || {}) };
      const arr = [...(m.dimensi || [])];
      const idx = arr.indexOf(dim);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(dim);
      m.dimensi = arr;
      return {
        ...prev,
        modul: { ...prev.modul, [unitId]: m }
      };
    });
  };

  const handleGenModul = (unitId: string) => {
    const u = state.unit.find(x => x.id === unitId);
    if (!u) return;
    const generated = genModul(u);
    setState(prev => {
      const current = prev.modul[unitId] || {};
      const merged = { ...generated, ...current };
      // fill empty keys
      Object.keys(generated).forEach(k => {
        if (!merged[k as keyof typeof merged]) {
          (merged as any)[k] = (generated as any)[k];
        }
      });
      return {
        ...prev,
        modul: { ...prev.modul, [unitId]: merged }
      };
    });
    showToast('Kerangka modul terisi.');
  };

  // LKPD handlers
  const handleSelectUnitL = (unitId: string) => {
    setState(prev => ({
      ...prev,
      ui: { ...prev.ui, unitL: unitId }
    }));
  };

  const handleChangeLkpd = (unitId: string, field: string, val: any) => {
    setState(prev => {
      const l = { ...(prev.lkpd[unitId] || {}), [field]: val };
      return {
        ...prev,
        lkpd: { ...prev.lkpd, [unitId]: l }
      };
    });
  };

  const handleGenLkpd = (unitId: string) => {
    const u = state.unit.find(x => x.id === unitId);
    if (!u) return;
    const tps = state.tp.filter(t => t.unitId === u.id);
    const generated = genLkpd(u, tps);
    setState(prev => {
      const current = prev.lkpd[unitId] || {};
      const merged = { ...generated, ...current };
      Object.keys(generated).forEach(k => {
        if (!merged[k as keyof typeof merged]) {
          (merged as any)[k] = (generated as any)[k];
        }
      });
      return {
        ...prev,
        lkpd: { ...prev.lkpd, [unitId]: merged }
      };
    });
    showToast('Kerangka LKPD terisi.');
  };

  // Copy Document helper
  const handleCopyDoc = async () => {
    const article = document.querySelector('article.font-serif');
    if (!article) {
      showToast('Dokumen tidak ditemukan.');
      return;
    }
    const html = `<div style="font-family:Times New Roman,serif;font-size:12pt">${article.innerHTML}</div>`;
    const text = (article as HTMLElement).innerText;

    try {
      if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([text], { type: 'text/plain' })
          })
        ]);
        showToast('Dokumen disalin. Tempel langsung di Word atau Google Docs.');
        return;
      }
    } catch (e) {}

    try {
      await navigator.clipboard.writeText(text);
      showToast('Teks dokumen disalin.');
      return;
    } catch (e) {
      showToast('Gagal menyalin dokumen.');
    }
  };

  const handleApplyAiData = (aiData: any) => {
    if (!aiData || !aiData.cp || !aiData.units) return;

    const newCp = (aiData.cp || []).map((c: any) => ({
      id: uid(),
      elemen: c.elemen || 'Elemen',
      teks: c.teks || ''
    }));

    const elementMap: Record<string, string> = {};
    newCp.forEach((c: any) => {
      elementMap[c.elemen.toLowerCase().trim()] = c.id;
    });
    const defaultCpId = newCp[0]?.id || uid();

    const newUnits: UnitItem[] = [];
    const newTps: TpItem[] = [];
    const newModul: Record<string, any> = {};
    const newLkpd: Record<string, any> = {};

    (aiData.units || []).forEach((u: any) => {
      const uId = uid();
      const matchedCpId = elementMap[(u.elemen || '').toLowerCase().trim()] || defaultCpId;
      const unitObj: UnitItem = {
        id: uId,
        sem: Number(u.sem) === 2 ? 2 : 1,
        nama: u.nama || 'Unit Materi',
        cpId: matchedCpId
      };
      newUnits.push(unitObj);

      const unitTpList: TpItem[] = [];
      (u.tps || []).forEach((t: any) => {
        const tpObj: TpItem = {
          id: uid(),
          unitId: uId,
          teks: t.teks || 'Tujuan pembelajaran',
          jp: Number(t.jp) || 4,
          ind: t.ind || '',
          r1: t.r1 || '',
          r2: t.r2 || '',
          r3: t.r3 || '',
          r4: t.r4 || '',
          teknik: t.teknik || 'Observasi dan tes tertulis'
        };
        newTps.push(tpObj);
        unitTpList.push(tpObj);
      });

      newModul[uId] = genModul(unitObj);
      newLkpd[uId] = genLkpd(unitObj, unitTpList);
    });

    const newState: AppState = {
      ...state,
      sample: false,
      cp: newCp.length > 0 ? newCp : state.cp,
      unit: newUnits.length > 0 ? newUnits : state.unit,
      tp: newTps.length > 0 ? newTps : state.tp,
      modul: newModul,
      lkpd: newLkpd,
      promes: {}
    };

    [1, 2].forEach(s => {
      const sem = s as Semester;
      const bs = newState.bulan.filter(b => b.sem === sem);
      const sl: string[] = [];
      bs.forEach(b => {
        for (let w = 0; w < b.n; w++) {
          if (!b.off.includes(w)) sl.push(`${b.id}:${w}`);
        }
      });
      const jpWeek = Number(newState.profil.jp) || 1;
      const uIds = newState.unit.filter(u => u.sem === sem).map(u => u.id);
      const tps = newState.tp.filter(t => uIds.includes(t.unitId));
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
        newState.promes[t.id] = set;
        cur += j;
      });
    });

    setState(newState);
  };

  const renderActiveTab = () => {
    const tab = state.ui.tab;
    const isDoc = !!state.ui.doc[tab];

    switch (tab) {
      case 'mulai':
        return (
          <BerandaTab
            state={state}
            onChangeProfile={handleChangeProfile}
            onTabSelect={handleTabSelect}
            onKeepSample={handleKeepSample}
            onResetAll={handleResetAll}
            onRestore={handleRestore}
            showToast={showToast}
          />
        );
      case 'waktu':
        return (
          <WaktuTab
            state={state}
            isDocView={isDoc}
            onToggleView={handleToggleView}
            onCopyDoc={handleCopyDoc}
            onChangeMonth={handleChangeMonth}
            onToggleWeekOff={handleToggleWeekOff}
            onAddMonth={handleAddMonth}
            onDeleteMonth={handleDeleteMonth}
          />
        );
      case 'cpatp':
        return (
          <CpatpTab
            state={state}
            isDocView={isDoc}
            onToggleView={handleToggleView}
            onCopyDoc={handleCopyDoc}
            onChangeCp={handleChangeCp}
            onAddCp={handleAddCp}
            onDeleteCp={handleDeleteCp}
            onChangeUnit={handleChangeUnit}
            onAddUnit={handleAddUnit}
            onDeleteUnit={handleDeleteUnit}
            onMoveUnit={handleMoveUnit}
            onChangeTp={handleChangeTp}
            onAddTp={handleAddTp}
            onDeleteTp={handleDeleteTp}
            onMoveTp={handleMoveTp}
            onApplyAiData={handleApplyAiData}
            showToast={showToast}
          />
        );
      case 'prota':
        return (
          <ProtaTab
            state={state}
            onCopyDoc={handleCopyDoc}
            onTabSelect={handleTabSelect}
          />
        );
      case 'promes':
        return (
          <PromesTab
            state={state}
            onCopyDoc={handleCopyDoc}
            onTabSelect={handleTabSelect}
            onSemSelect={handleSemSelect}
            onAutoSebar={handleAutoSebar}
            onClearPromes={handleClearPromes}
            onToggleCell={handleToggleCell}
          />
        );
      case 'kktp':
        return (
          <KktpTab
            state={state}
            isDocView={isDoc}
            onToggleView={handleToggleView}
            onCopyDoc={handleCopyDoc}
            onChangeProfile={handleChangeProfile}
            onChangeTp={handleChangeTp}
            onGenKktp={handleGenKktp}
            onGenAllKktp={handleGenAllKktp}
            onTabSelect={handleTabSelect}
          />
        );
      case 'modul':
        return (
          <ModulTab
            state={state}
            isDocView={isDoc}
            onToggleView={handleToggleView}
            onCopyDoc={handleCopyDoc}
            onSelectUnit={handleSelectUnit}
            onChangeModul={handleChangeModul}
            onToggleDimensi={handleToggleDimensi}
            onGenModul={handleGenModul}
            onTabSelect={handleTabSelect}
          />
        );
      case 'lkpd':
        return (
          <LkpdTab
            state={state}
            isDocView={isDoc}
            onToggleView={handleToggleView}
            onCopyDoc={handleCopyDoc}
            onSelectUnitL={handleSelectUnitL}
            onChangeLkpd={handleChangeLkpd}
            onGenLkpd={handleGenLkpd}
            onTabSelect={handleTabSelect}
          />
        );
      default:
        return <div>Halaman tidak ditemukan.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-[236px_minmax(0,1fr)] gap-8 items-start">
        <Navbar state={state} onSelectTab={handleTabSelect} />
        <main className="min-w-0 flex flex-col gap-6">{renderActiveTab()}</main>
      </div>
      <Toast message={toastMsg} />
    </div>
  );
}
