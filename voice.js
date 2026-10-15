/* ============================================================
   VOICE — Voz pedagógica em pt-BR
   Camada 2: narração das ações do jogo
   ============================================================ */

const STORAGE_KEY = 'airplane.voice.enabled';

/* Estado */
let enabled = localStorage.getItem(STORAGE_KEY) !== '0';
let voicePtBR = null;
let voiceReady = false;

/* ============================================================
   NOMES FALADOS DAS PEÇAS
   Cada peça tem um texto curto pra falar (sem jargão)
   ============================================================ */
const PART_SPEECH = {
  fuselage:  { name: 'fuselagem',  article: 'a' },
  wing:      { name: 'asa',        article: 'a' },
  tail:      { name: 'cauda',      article: 'a' },
  fin:       { name: 'leme',       article: 'o' },
  propeller: { name: 'hélice',     article: 'a' },
  nose:      { name: 'bico',       article: 'o' },
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

/* ============================================================
   CARREGAR VOZES
   ============================================================ */
const loadVoices = () => {
  if (!('speechSynthesis' in window)) {
    console.warn('[Voice] speechSynthesis não suportado');
    return;
  }
  const voices = speechSynthesis.getVoices();
  voicePtBR = voices.find(v => v.lang === 'pt-BR')
           || voices.find(v => v.lang.startsWith('pt-BR'))
           || voices.find(v => v.lang.startsWith('pt'))
           || null;

  if (voicePtBR) {
    voiceReady = true;
    console.log('✅ Voz pt-BR disponível:', voicePtBR.name);
  } else {
    console.warn('⚠️ Nenhuma voz pt-BR encontrada. Vozes disponíveis:',
      voices.map(v => v.lang).join(', '));
  }
};

if ('speechSynthesis' in window) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

/* ============================================================
   FALAR
   ============================================================ */
const speak = (text, options = {}) => {
  if (!enabled) return;
  if (!voiceReady) return;
  if (!('speechSynthesis' in window)) return;

  try {
    speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'pt-BR';
    utter.voice = voicePtBR;
    utter.rate = options.rate || 0.95;
    utter.pitch = options.pitch || 1.1;
    utter.volume = options.volume || 0.9;

    speechSynthesis.speak(utter);
  } catch (err) {
    console.warn('[Voice] erro:', err);
  }
};

/* ============================================================
   API PÚBLICA
   ============================================================ */
export const Voice = {
  isEnabled: () => enabled,

  toggle() {
    enabled = !enabled;
    localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
    if (!enabled) speechSynthesis.cancel();
    return enabled;
  },

  /** Falado ao começar a montar o avião */
  welcome(planeName) {
    speak(`Vamos montar o ${planeName}!`);
  },

  /** Falado ao pegar uma peça */
  pickup(partId) {
    const info = PART_SPEECH[partId];
    if (!info) return;
    speak(`Pegou ${info.article} ${info.name}`);
  },

  /** Falado ao encaixar uma peça */
  snap(partId) {
    const info = PART_SPEECH[partId];
    if (!info) return;
    speak(`Muito bem! ${info.article === 'a' ? 'A' : 'O'} ${info.name} está no lugar!`);
  },

  /** Falado ao errar */
  wrong() {
    speak('Tente mais perto do contorno');
  },

  /** Falado ao completar */
  win(planeName) {
    speak(`Parabéns! Você montou o ${planeName}!`);
  },

  /** Fala um texto livre (para debug) */
  say(text) {
    speak(text);
  },

  stop() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }
};
