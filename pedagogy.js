/* ============================================================
   PEDAGOGY — Card pedagógico visual
   Camada 3.1: card básico (sem abas) + 3.2: abas + 3.3: conteúdo
   ============================================================ */
import { LESSONS } from './lessons.js';

let currentPartId = null;
let currentTab = 'sci';

/* ---------- Abrir card ---------- */
export const openLessonCard = (partId) => {
  const lesson = LESSONS[partId];
  if (!lesson) {
    console.warn('[Pedagogy] Sem ficha para:', partId);
    return false;
  }

  currentPartId = partId;
  currentTab = 'sci';

  /* Preenche header */
  document.getElementById('ped-emoji').textContent = lesson.emoji;
  document.getElementById('ped-name-pt').textContent = lesson.name;
  document.getElementById('ped-en-word').textContent = lesson.nameEn;
  document.getElementById('ped-en-pron').textContent = lesson.pron;

  /* Reseta abas — sempre começa em ciências */
  document.querySelectorAll('.ped-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === 'sci');
  });

  /* Renderiza a aba de ciências */
  renderTab('sci');

  /* Mostra overlay */
  const overlay = document.getElementById('ped-overlay');
  overlay.classList.add('active');

  console.log('📖 Card aberto:', lesson.name);
  return true;
};

/* ---------- Fechar card ---------- */
export const closeLessonCard = () => {
  document.getElementById('ped-overlay').classList.remove('active');
  currentPartId = null;
};

/* ---------- Verificar se está aberto ---------- */
export const isCardOpen = () => {
  return document.getElementById('ped-overlay').classList.contains('active');
};

/* ---------- Renderizar aba ---------- */
const renderTab = (tabId) => {
  const lesson = LESSONS[currentPartId];
  if (!lesson) return;

  const body = document.getElementById('ped-body');
  let html = '';

  if (tabId === 'sci') {
    html = `
      <div class="ped-pane">
        <h3 class="ped-pane-title sci">${lesson.sci.title}</h3>
        <p class="ped-text">${lesson.sci.text}</p>
        <div class="ped-fact sci">
          <strong>💡 Sabia?</strong> ${lesson.sci.fact}
        </div>
      </div>
    `;
  } 
  else if (tabId === 'mat') {
    html = `
      <div class="ped-pane">
        <h3 class="ped-pane-title mat">${lesson.mat.title}</h3>
        <p class="ped-text">${lesson.mat.text}</p>
        <div class="ped-fact mat">
          <strong>🔢 Pergunta:</strong> ${lesson.mat.q}<br>
          <strong>✅ Resposta:</strong> ${lesson.mat.a}
        </div>
      </div>
    `;
  } 
  else if (tabId === 'por') {
    const sylls = lesson.por.syllables.map(s => 
      `<span class="syllable ${s.v ? 'vowel' : 'cons'}">${s.s}</span>`
    ).join('');
    html = `
      <div class="ped-pane">
        <h3 class="ped-pane-title por">${lesson.por.title}</h3>
        <div class="syllables-row">${sylls}</div>
        <p class="ped-text"><strong>Classe:</strong> ${lesson.por.classe}</p>
        <p class="ped-text"><strong>Família:</strong></p>
        <div class="ped-fam">
          ${lesson.por.family.map(f => `<span class="fam-tag">${f}</span>`).join('')}
        </div>
        <div class="ped-fact por">
          <strong>📝 Frase:</strong> ${lesson.por.sentence}
        </div>
      </div>
    `;
  } 
  else if (tabId === 'eng') {
    html = `
      <div class="ped-pane">
        <h3 class="ped-pane-title eng">${lesson.eng.title}</h3>
        <div class="eng-word">${lesson.eng.word}</div>
        <div class="eng-pron">Pronúncia: <strong>${lesson.eng.pron}</strong></div>
        <div class="ped-fact eng">
          <div class="eng-example">"${lesson.eng.sentence}"</div>
          <div class="eng-translation">→ ${lesson.eng.translation}</div>
        </div>
      </div>
    `;
  }

  body.innerHTML = html;
};

/* ---------- Setup de eventos (chamar 1 vez no boot) ---------- */
export const initPedagogy = () => {
  /* Abas */
  document.querySelectorAll('.ped-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      if (!currentPartId) return;
      document.querySelectorAll('.ped-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      renderTab(currentTab);
    });
  });

  /* Botão fechar */
  document.getElementById('ped-close').addEventListener('click', () => {
    closeLessonCard();
    if (window.__onCardClosed) window.__onCardClosed();
  });

  /* Botão continuar */
  document.getElementById('ped-next').addEventListener('click', () => {
    closeLessonCard();
    if (window.__onCardClosed) window.__onCardClosed();
  });

  /* Botão ouvir */
  document.getElementById('ped-listen').addEventListener('click', () => {
    if (!currentPartId) return;
    const lesson = LESSONS[currentPartId];
    if (!lesson) return;

    let text = '';
    if (currentTab === 'sci') {
      text = lesson.sci.title + '. ' + lesson.sci.text;
    } else if (currentTab === 'mat') {
      text = lesson.mat.title + '. ' + lesson.mat.text;
    } else if (currentTab === 'por') {
      text = lesson.por.syllables.map(s => s.s).join('-');
    } else if (currentTab === 'eng') {
      text = lesson.eng.word + '. ' + lesson.eng.sentence;
    }

    if (window.__voiceSpeak) {
      window.__voiceSpeak(text);
    }
  });

  console.log('✅ pedagogy.js inicializado');
};

/* ---------- Fala a introdução do card ---------- */
export const speakLessonIntro = (partId) => {
  const lesson = LESSONS[partId];
  if (!lesson) return;
  if (window.__voiceSpeak) {
    window.__voiceSpeak(`Você encaixou ${lesson.name}. Vamos aprender mais sobre ela!`);
  }
};
