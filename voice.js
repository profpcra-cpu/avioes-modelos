/* ============================================================
   VOICE — Voz pedagógica em pt-BR (v2 — com retry)
   Camada 2: narração das ações do jogo
   ============================================================ */

const STORAGE_KEY = 'airplane.voice.enabled';

let enabled = localStorage.getItem(STORAGE_KEY) !== '0';
let voicePtBR = null;
let voiceReady = false;
let retryCount = 0;
const MAX_RETRIES = 30; // 30 × 100ms = 3 segundos

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

/* ---------- Carregar vozes com retry ---------- */
const loadVoices = () => {
  if (!('speechSynthesis' in window)) {
    console.warn('[Voice] speechSynthesis não suportado neste navegador');
    return false;
  }

  const voices = speechSynthesis.getVoices();

  /* Lista vazia? Tenta de novo em 100ms */
  if (voices.length === 0) {
    retryCount++;
    if (retryCount < MAX_RETRIES) {
      setTimeout(loadVoices, 100);
    } else {
      console.warn('[Voice] Desisti após 3s. Vozes nunca carregaram.');
    }
    return false;
  }

  /* Lista carregada! Procura pt-BR */
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
    console.warn('⚠️ Nenhuma voz pt-BR. Vozes disponíveis:',
      voices.map(v => v.lang).join(', ') || '(vazio)');
    return false;
  }
};

/* ---------- Inicialização ---------- */
if ('speechSynthesis' in window) {
  /* Tenta 1: imediato */
  loadVoices();
  /* Tenta 2: quando o navegador avisar */
  speechSynthesis.onvoiceschanged = () => {
    retryCount = 0;
    loadVoices();
  };
  /* Tenta 3: fallback com retry (caso nada dispare) */
  setTimeout(() => {
    if (!voiceReady) {
      console.log('[Voice] Tentando recarregar vozes...');
      retryCount = 0;
      loadVoices();
    }
  }, 500);
}

/* ---------- Função de falar ---------- */
const speak = (text, options = {}) => {
  if (!enabled) {
    console.log('[Voice] Desligado — não fala:', text);
    return;
  }
  if (!voiceReady) {
    console.warn('[Voice] Voz não pronta — não fala:', text);
    return;
  }
  if (!('speechSynthesis' in window)) return;

  try {
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'pt-BR';
    utter.voice = voicePtBR;
    utter.rate = options.rate || 0.95;
    utter.pitch = options.pitch || 1.1;
    utter.volume = options.volume || 0.9;

    utter.onstart = () => console.log('🔊 [Voice] falando:', text);
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
    console.log('[Voice] Modo voz:', enabled ? 'LIGADO' : 'DESLIGADO');
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

  /* Pra debug — força um teste */
  test() {
    console.log('[Voice] Teste manual');
    console.log('  - Enabled:', enabled);
    console.log('  - Ready:', voiceReady);
    console.log('  - Voz:', voicePtBR ? voicePtBR.name : 'nenhuma');
    if (voiceReady) {
      speak('Teste de voz funcionando perfeitamente!');
    } else {
      speak('A voz ainda não carregou. Tente novamente em alguns segundos.');
    }
  }
};
