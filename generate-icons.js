#!/usr/bin/env node
/* ============================================================
   Gerador de ícones PWA — Airplane Builder 3D
   Converte SVGs de icons-src/ em PNGs para icons/

   Uso:
     node generate-icons.js

   Requer:
     npm install sharp
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');

/* Carrega sharp com mensagem amigável se faltar */
let sharp;
try {
  sharp = require('sharp');
} catch (err) {
  console.error('');
  console.error('❌ A biblioteca "sharp" não está instalada.');
  console.error('');
  console.error('   Rode primeiro:');
  console.error('     npm install');
  console.error('');
  console.error('   Ou diretamente:');
  console.error('     npm install sharp');
  console.error('');
  process.exit(1);
}

/* ---------- Configuração ---------- */
const SRC_DIR = path.join(__dirname, 'icons-src');
const OUT_DIR = path.join(__dirname, 'icons');

/* Cada job: pega um SVG, gera um PNG no tamanho especificado */
const JOBS = [
  { svg: 'icon.svg',           out: 'icon-192.png',        size: 192 },
  { svg: 'icon.svg',           out: 'icon-512.png',        size: 512 },
  { svg: 'icon-maskable.svg',  out: 'icon-maskable.png',   size: 512 },
  { svg: 'icon.svg',           out: 'apple-touch-icon.png', size: 180, bg: '#0a1628' },
  { svg: 'favicon.svg',        out: 'favicon-32.png',      size: 32 }
];

/* ---------- Helpers ---------- */
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const hexToRgb = (hex) => {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
    alpha: 1
  };
};

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
};

/* ---------- Geração ---------- */
const generate = async () => {
  console.log('');
  console.log('🎨 Airplane Builder — Gerador de ícones PWA');
  console.log('═══════════════════════════════════════════');
  console.log('');

  /* Valida pastas */
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`❌ Pasta não encontrada: ${SRC_DIR}`);
    console.error('   Crie a pasta "icons-src/" e coloque os SVGs dentro.');
    process.exit(1);
  }

  ensureDir(OUT_DIR);

  /* Lista SVGs disponíveis */
  const svgFiles = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.svg'));
  if (svgFiles.length === 0) {
    console.error(`❌ Nenhum arquivo .svg encontrado em ${SRC_DIR}`);
    process.exit(1);
  }
  console.log(`📂 SVGs fonte:  ${svgFiles.join(', ')}`);
  console.log(`📂 Saída:       ${OUT_DIR}`);
  console.log('');

  /* Processa cada job */
  let ok = 0;
  let fail = 0;

  for (const job of JOBS) {
    const svgPath = path.join(SRC_DIR, job.svg);
    const outPath = path.join(OUT_DIR, job.out);

    if (!fs.existsSync(svgPath)) {
      console.error(`⚠️  SVG não encontrado: ${job.svg} (pulando ${job.out})`);
      fail++;
      continue;
    }

    try {
      const svgBuffer = fs.readFileSync(svgPath);
      const width = job.size;
      const height = job.size;

      /* Configuração base do sharp */
      let pipeline = sharp(svgBuffer, {
        density: 384 /* renderiza em alta resolução antes de reduzir */
      })
        .resize(width, height, {
          fit: 'contain',
          position: 'center',
          background: job.bg
            ? hexToRgb(job.bg)
            : { r: 0, g: 0, b: 0, alpha: 0 }
        });

      /* Apple touch icons NÃO devem ter transparência */
      if (job.bg) {
        pipeline = pipeline.flatten({ background: job.bg });
      }

      /* Exporta PNG */
      await pipeline.png({ compressionLevel: 9 }).toFile(outPath);

      const stats = fs.statSync(outPath);
      console.log(
        `✅ ${job.out.padEnd(24)} ` +
        `${width}×${height}`.padEnd(12) +
        formatBytes(stats.size)
      );
      ok++;
    } catch (err) {
      console.error(`❌ Falha em ${job.out}:`, err.message);
      fail++;
    }
  }

  /* Resumo final */
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log(`📦 Gerados: ${ok}   ❌ Falhas: ${fail}`);
  console.log(`📂 Saída:   ${OUT_DIR}`);
  console.log('');

  if (fail > 0) process.exit(1);

  console.log('🎉 Ícones PWA prontos! Agora commit os PNGs gerados.');
  console.log('');
};

generate().catch(err => {
  console.error('');
  console.error('💥 Erro fatal:', err);
  console.error('');
  process.exit(1);
});
