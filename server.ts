import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API endpoint for AI CP-ATP Generation referencing kurikulum.kemendikdasmen.go.id standards
app.post('/api/generate-cp-atp', async (req, res) => {
  try {
    const { mapel, fase, kelas, topik } = req.body;

    const prompt = `Anda adalah ahli kurikulum dan praktisi pendidikan kejuruan profesional di Indonesia.
Buatkan draf Capaian Pembelajaran (CP), Alur Tujuan Pembelajaran (ATP), dan kriteria KKTP berdasarkan standar kompetensi industri, panduan Badan Standar Nasional Pendidikan (BSNP), serta standar Ikatan Akuntan Indonesia (IAI) untuk:
Mata Pelajaran/Jurusan: ${mapel || 'Akuntansi'}
Fase: ${fase || 'E'}
Kelas: ${kelas || 'X'}
Fokus / Topik Tambahan (opsional): ${topik || 'Umum'}

PENTING: 
1. Sesuaikan sepenuhnya dengan jenjang SMK (Sekolah Menengah Kejuruan) untuk Fase ${fase || 'E'} / ${kelas || 'X'} (tanpa ada referensi tingkat SD atau SMP sama sekali).
2. Jika ini Akuntansi, gunakan materi standar industri dan kejuruan seperti Dasar-Dasar Akuntansi dan Keuangan Lembaga, Etika Profesi Akuntan, Siklus Akuntansi Perusahaan Jasa dan Dagang, Komputer Akuntansi, serta Perpajakan Dasar sesuai praktik terbaik di dunia kerja (DUDI).

Berikan hasil dalam format JSON murni (tanpa markdown backticks di luar JSON) dengan struktur berikut:
{
  "cp": [
    { "elemen": "Nama Elemen", "teks": "Teks deskripsi Capaian Pembelajaran resmi sesuai kurikulum..." }
  ],
  "units": [
    {
      "nama": "Nama Lingkup Materi / Unit",
      "sem": 1 atau 2,
      "elemen": "Nama Elemen yang bersesuaian",
      "tps": [
        {
          "teks": "Kalimat tujuan pembelajaran (diawali tanpa 'peserta didik dapat' karena sudah ditambahkan otomatis atau dengan kalimat aktif)",
          "jp": 8,
          "ind": "Kriteria ketercapaian...",
          "r1": "Rubrik perlu bimbingan...",
          "r2": "Rubrik cukup...",
          "r3": "Rubrik baik...",
          "r4": "Rubrik sangat baik...",
          "teknik": "Observasi dan tes tertulis"
        }
      ]
    }
  ]
}
Pastikan ada minimal 3 hingga 5 unit yang tersebar di Semester 1 dan Semester 2, lengkap dengan JP dan rubrik KKTP 4 tingkat yang merujuk langsung ke tujuan pembelajaran tersebut.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      }
    });

    const text = response.text || '{}';
    // Clean potential json code blocks if any
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleaned);
    res.json(data);
  } catch (error: any) {
    console.error('Error generating CP-ATP:', error);
    res.status(500).json({ error: error.message || 'Gagal menghasilkan CP-ATP dengan AI' });
  }
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
