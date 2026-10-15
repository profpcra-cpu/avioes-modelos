#!/usr/bin/env node
/* ============================================================
   Gerador de ícones PWA — Airplane Builder
   Uso: node generate-icons.js
   Requer: npm install sharp
   ============================================================ */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC_DIR = path.join(__dirname, 'icons-src');
const OUT_DIR = path.join(__dirname, 'icons');

/* Mapa: arquivo SVG → lista de PNGs a gerar */
const JOBS = [
  { svg: 'icon.svg',           out: 'icon-192.png',       size: 192 },
  { svg: 'icon.svg',           out: 'icon-512.png',       size: 512 },
  { svg: 'icon-maskable.svg',  out: 'icon-maskable.png',  size: 512 },
  { svg: 'icon.svg',           out: 'apple-touch-icon.png', size: 180, bg: '#0a1628' },
  { svg: 'favicon.svg',        out: 'favicon-32.png',     size: 32 }
];

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const generate = async () => {
  ensureDir(OUT_DIR);

  let ok = 0, fail = 0;

  for (const job of JOBS) {
    const svgPath = path.join(SRC_DIR, job.svg);
    const outPath = path.join(OUT_DIR, job.out);

    if (!fs.existsSync(svgPath)) {
      console.error(`❌ SVG não encontrado: ${job.svg}`);
      fail++;
      continue;
    }

    try {
      const svgBuffer = fs.readFileSync(svgPath);

      let pipeline = sharp(svgBuffer, { density: 384 }) // renderiza em alta densidade
        .resize(job.size, job.size, {
          fit: 'contain',
          background: job.bg
            ? { r: 10, g: 22, b: 40, alpha: 1 }
            : { r: 0, g: 0, b: 0, alpha: 0 }
        });

      // Apple touch icons não devem ter transparência
      if (job.bg) {
        pipeline = pipeline.flatten({ background: job.bg });
      }

      await pipeline.png({ compressionLevel: 9 }).toFile(outPath);

      const stats = fs.statSync(outPath);
      const kb = (stats.size / 1024).toFixed(1);
      console.log(`✅ ${job.out.padEnd(24)} ${job.size}×${job.size}  ${kb} KB`);
      ok++;
    } catch (err) {
      console.error(`❌ Falha em ${job.out}:`, err.message);
      fail++;
    }
  }

  console.log('');
  console.log(`📦 Gerados: ${ok} | ❌ Falhas: ${fail}`);
  console.log(`📂 Saída:   ${OUT_DIR}`);
  if (fail > 0) process.exit(1);
};

generate().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
