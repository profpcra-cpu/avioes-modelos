/* ============================================================
   VOICE — Voz pedagógica em pt-BR (v3)
   Com tabela de pronúncia corrigida
   ============================================================ */

const STORAGE_KEY = 'airplane.voice.enabled';

let enabled = localStorage.getItem(STORAGE_KEY) !== '0';
let voicePtBR = null;
let voiceReady = false;
let retryCount = 0;
const MAX_RETRIES = 30;

/* ---------- Tabela de pronúncia corrigida ----------
   Palavra escrita → Como deve ser FALADA
   (evita erros de fonética do TTS)
   --------------------------------------------------- */
const PRONUNCIATION_FIX = {
  'fuselagem':    'fuzelagem',
  'fuselage':     'fuzelagem',
  'asa':          'aza',
  'cauda':        'cauda',
  'leme':         'leme',
  'hélice':       'élice',
  'bico':         'bico',
  'estabilizador':'estabilizador',
  'motor':        'motor',
  'esquerdo':     'esquerdo',
  'direito':      'direito',
  'pilar':        'pilar',
  'traseira':     'traseira',
  'biplano':      'biplano',
  'avião':        'aviãum',
  'jato':         'jato',
  'caça':         'cassa'
};

/* ---------- Corrige o texto aplicando pronúncia ---------- */
const fixPronunciation = (text) => {
  let fixed = text;
  for (const [wrong, right] of Object.entries(PRONUNCIATION_FIX)) {
    /* Substitui apenas palavras inteiras (com limites) */
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    fixed = fixed.replace(regex, (match) => {
      /* Mantém capitalização original */
      if (match[0] === match[0].toUpperCase()) {
        return right.charAt(0).toUpperCase() + right.slice(1);
      }
      return right;
    });
  }
  return fixed;
};

/* ---------- Nomes falados das peças ---------- */
const PART_SPEECH = {
  fuselage:      { name: 'fuselagem',      article: 'a' },
  wing:          { name: 'asa',            article: 'a' },
  tail:          { name: 'cauda',          article: 'a' },
  fin:           { name: 'leme',           article: 'o' },
  propeller:     { name: 'hélice',         article: 'a' },
  nose:          { name: 'bico',           article: 'o' },
  'wing-top':    { name: 'asa de cima',    article: 'a' },
  'wing-bottom': { name: 'asa de baixo',   article: 'a' },
  'wing-l':      { name: 'asa esquerda',   article: 'a' },
  'wing-r':      { name: 'asa direita',    article: 'a' },
  'wing-left':   { name: 'asa esquerda',   article: 'a' },
  'wing-right':  { name: 'asa direita',    article: 'a' },
  'pillar-l':    { name: 'pilar esquerdo', article: 'o' },
  'pillar-r':    { name: 'pilar direito',  article: 'o' },
  'engine-l':    { name: 'motor esquerdo', article: 'o' },
  'engine-r':    { name: 'motor direito',  article: 'o' },
  'tail-wing':   { name: 'asa traseira',   article: 'a' }
};

/* ---------- Carregar vozes ---------- */
const loadVoices = () => {
  if (!('speechSynthesis' in window)) {
    console.warn('[Voice] speechSynthesis não suportado');
    return false;
  }

  const voices = speechSynthesis.getVoices();

  if (voices.length === 0) {
    retryCount++;
    if (retryCount < MAX_RETRIES) setTimeout(loadVoices, 100);
    else console.warn('[Voice] Desisti após 3s.');
    return false;
  }

  voicePtBR = voices.find(v => v.lang === 'pt-BR' && v.localService)
           || voices.find(v => v.lang === 'pt-BR')
           || voices.find(v => v.lang.startsWith('pt-BR'))
           || voices.find(v => v.lang.startsWith('pt'))
           || null;

  if (voicePtBR) {
    voiceReady = true;
    console.log('✅ Voz pt-BR pronta:', voicePtBR.name, '|', voicePtBR.lang);
    return true;
  } else {
    console.warn('⚠️ Nenhuma voz pt-BR. Vozes:', voices.map(v => v.lang).join(', '));
    return false;
  }
};

if ('speechSynthesis' in window) {
  loadVoices();
  speechSynthesis.onvoiceschanged = () => { retryCount = 0; loadVoices(); };
  setTimeout(() => {
    if (!voiceReady) { retryCount = 0; loadVoices(); }
  }, 500);
}

/* ---------- Falar ---------- */
const speak = (text, options = {}) => {
  if (!enabled) return;
  if (!voiceReady) return;
  if (!('speechSynthesis' in window)) return;

  const fixedText = fixPronunciation(text);

  try {
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(fixedText);
    utter.lang = 'pt-BR';
    utter.voice = voicePtBR;
    utter.rate = options.rate || 0.9;    /* um pouco mais devagar p/ clareza */
    utter.pitch = options.pitch || 1.05;
    utter.volume = options.volume || 0.95;

    utter.onstart = () => console.log('🔊 [Voice]', fixedText);
    utter.onerror = (e) => console.warn('🔊 [Voice] erro:', e);

    speechSynthesis.speak(utter);
  } catch (err) {
    console.warn('[Voice] exceção:', err);
  }
};

/* ---------- API pública ---------- */
export const Voice = {
  isEnabled: () => enabled,
  isReady: () => voiceReady,

  toggle() {
    enabled = !enabled;
    localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
    if (!enabled && 'speechSynthesis' in window) speechSynthesis.cancel();
    return enabled;
  },

  welcome(planeName) {
    speak(`Vamos montar o ${planeName}!`);
  },

  pickup(partId) {
    const info = PART_SPEECH[partId];
    if (!info) return;
    speak(`Pegou ${info.article} ${info.name}`);
  },

  snap(partId) {
    const info = PART_SPEECH[partId];
    if (!info) return;
    const art = info.article === 'a' ? 'A' : 'O';
    speak(`Muito bem! ${art} ${info.name} está no lugar!`);
  },

  wrong() {
    speak('Tente mais perto do contorno');
  },

  win(planeName) {
    speak(`Parabéns! Você montou o ${planeName}!`);
  },

  say(text) {
    speak(text);
  },

  stop() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  },

  test() {
    console.log('[Voice] Teste');
    console.log('  - Enabled:', enabled);
    console.log('  - Ready:', voiceReady);
    console.log('  - Voz:', voicePtBR ? voicePtBR.name : 'nenhuma');
    speak('Teste de voz. Fuselagem, asa, hélice.');
  }
};
