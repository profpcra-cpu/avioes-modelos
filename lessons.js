/* ============================================================
   LESSONS — Fichas pedagógicas das peças
   Camada 3: conteúdo em 4 disciplinas
   ============================================================ */

export const LESSONS = {
  fuselage: {
    emoji: '🚀',
    name: 'Fuselagem',
    nameEn: 'Fuselage',
    pron: 'FIU-se-ladj',
    ipa: '/ˈfjuː.sə.lɑːʒ/',
    sci: {
      title: 'O corpo do avião',
      text: 'A fuselagem é o corpo do avião. O formato arredondado ajuda a cortar o ar com menos esforço. Isso se chama aerodinâmica.',
      fact: 'Um Boeing 747 tem 70 metros de fuselagem — cabe uma quadra de tênis dentro!'
    },
    mat: {
      title: 'Formas geométricas',
      text: 'A fuselagem é um cilindro. Um cilindro tem 2 bases circulares e uma superfície curva.',
      q: 'Se um avião tem 3 cilindros, quantas bases circulares tem?',
      a: '6 bases! (3 × 2)'
    },
    por: {
      title: 'A palavra FUSELAGEM',
      syllables: [
        { s: 'FU', v: false },
        { s: 'SE', v: true },
        { s: 'LA', v: true },
        { s: 'GEM', v: false }
      ],
      classe: 'Substantivo feminino',
      family: ['fuselado', 'fuselar'],
      sentence: 'A fuselagem do avião é comprida.'
    },
    eng: {
      title: 'Fuselage in English',
      word: 'Fuselage',
      pron: 'FIU-se-ladj',
      sentence: 'The fuselage is white.',
      translation: 'A fuselagem é branca.'
    }
  },

  wing: {
    emoji: '🪽',
    name: 'Asa',
    nameEn: 'Wing',
    pron: 'UÍNG',
    ipa: '/wɪŋ/',
    sci: {
      title: 'Como a asa faz o avião voar?',
      text: 'A asa é curvada em cima. O ar passa mais rápido por cima dela e empurra a asa pra cima. Isso se chama sustentação!',
      fact: 'Sem asas, o avião cairia como uma pedra. As asas são o segredo do voo!'
    },
    mat: {
      title: 'Simetria',
      text: 'O avião tem simetria: se dobrar no meio, as duas metades ficam iguais.',
      q: 'Se cada asa mede 15 metros, qual a envergadura total?',
      a: '30 metros! (15 + 15)'
    },
    por: {
      title: 'A palavra ASA',
      syllables: [
        { s: 'A', v: true },
        { s: 'SA', v: true }
      ],
      classe: 'Substantivo feminino',
      family: ['aseiro', 'asinha', 'desasar', 'asar'],
      sentence: 'A asa do avião é vermelha.'
    },
    eng: {
      title: 'Wing in English',
      word: 'Wing',
      pron: 'UÍNG',
      sentence: 'The wing is red.',
      translation: 'A asa é vermelha.'
    }
  },

  tail: {
    emoji: '🎏',
    name: 'Cauda',
    nameEn: 'Tail',
    pron: 'TEIL',
    ipa: '/teɪl/',
    sci: {
      title: 'O equilíbrio do voo',
      text: 'A cauda fica atrás e equilibra o avião. É como o rabo de um papagaio que ajuda ele a voar reto!',
      fact: 'Sem cauda, o avião giraria como um pião no ar!'
    },
    mat: {
      title: 'Comparando tamanhos',
      text: 'A cauda é menor que a asa. Se a asa mede 4,5 metros e a cauda 1,4 metro:',
      q: 'Quanto é 4,5 − 1,4?',
      a: '3,1 metros de diferença!'
    },
    por: {
      title: 'A palavra CAUDA',
      syllables: [
        { s: 'CAU', v: true },
        { s: 'DA', v: true }
      ],
      classe: 'Substantivo feminino',
      family: ['caudinha', 'acaudatado'],
      sentence: 'A cauda do avião é amarela.'
    },
    eng: {
      title: 'Tail in English',
      word: 'Tail',
      pron: 'TEIL',
      sentence: 'The tail is yellow.',
      translation: 'A cauda é amarela.'
    }
  },

  fin: {
    emoji: '🔺',
    name: 'Estabilizador',
    nameEn: 'Fin',
    pron: 'FIN',
    ipa: '/fɪn/',
    sci: {
      title: 'O leme do avião',
      text: 'O estabilizador vertical tem um leme que faz o avião virar para os lados. É igual ao leme de um barco!',
      fact: 'O piloto move o leme com os pés — não com as mãos!'
    },
    mat: {
      title: 'Triângulos',
      text: 'Olhando de lado, o estabilizador forma um triângulo. Um triângulo tem 3 lados e 3 ângulos.',
      q: 'Quantos lados tem uma pirâmide de base triangular?',
      a: '5 lados!'
    },
    por: {
      title: 'A palavra LEME',
      syllables: [
        { s: 'LE', v: true },
        { s: 'ME', v: true }
      ],
      classe: 'Substantivo masculino',
      family: ['lemar', 'governar'],
      sentence: 'O leme gira o avião.'
    },
    eng: {
      title: 'Fin / Rudder in English',
      word: 'Fin',
      pron: 'FIN',
      sentence: 'The fin is purple.',
      translation: 'O estabilizador é roxo.'
    }
  },

  propeller: {
    emoji: '🌀',
    name: 'Hélice',
    nameEn: 'Propeller',
    pron: 'pro-PÉ-ler',
    ipa: '/prəˈpel.ər/',
    sci: {
      title: 'Empurrando o ar',
      text: 'A hélice gira muito rápido e joga o ar para trás. O ar empurra o avião para frente. Isso se chama empuxo!',
      fact: 'A hélice pode girar até 2.500 vezes por minuto!'
    },
    mat: {
      title: 'Rotação e velocidade',
      text: 'A hélice gira em rotação. Se ela dá 2 voltas por segundo:',
      q: 'Quantas voltas dá em 60 segundos (1 minuto)?',
      a: '120 voltas por minuto!'
    },
    por: {
      title: 'A palavra HÉLICE',
      syllables: [
        { s: 'HÉ', v: true },
        { s: 'LI', v: true },
        { s: 'CE', v: true }
      ],
      classe: 'Substantivo feminino',
      family: ['helicoidal', 'helicóptero'],
      sentence: 'A hélice gira rápido.'
    },
    eng: {
      title: 'Propeller in English',
      word: 'Propeller',
      pron: 'pro-PÉ-ler',
      sentence: 'The propeller spins fast.',
      translation: 'A hélice gira rápido.'
    }
  },

  /* Peças extras dos outros aviões (mesmo conteúdo base) */
  nose: {
    emoji: '🔺',
    name: 'Bico',
    nameEn: 'Nose',
    pron: 'NOUZ',
    ipa: '/noʊz/',
    sci: {
      title: 'O bico corta o ar',
      text: 'O bico pontudo do avião corta o ar e ajuda a voar mais rápido.',
      fact: 'Aviões supersônicos têm bico bem fino para voar mais rápido que o som!'
    },
    mat: {
      title: 'Formato cônico',
      text: 'O bico tem forma de cone. Um cone tem 1 base circular.',
      q: 'Quantas bases tem um cone?',
      a: '1 base circular!'
    },
    por: {
      title: 'A palavra BICO',
      syllables: [
        { s: 'BI', v: true },
        { s: 'CO', v: true }
      ],
      classe: 'Substantivo masculino',
      family: ['biquinho', 'bicar'],
      sentence: 'O bico do avião é verde.'
    },
    eng: {
      title: 'Nose in English',
      word: 'Nose',
      pron: 'NOUZ',
      sentence: 'The nose is green.',
      translation: 'O bico é verde.'
    }
  },

  'wing-top': {
    emoji: '🪽',
    name: 'Asa de Cima',
    nameEn: 'Top Wing',
    pron: 'TÓP UÍNG',
    ipa: '/tɒp wɪŋ/',
    sci: {
      title: 'Duas asas são melhores',
      text: 'O biplano tem 2 asas empilhadas. Isso dá mais sustentação para voar devagar!',
      fact: 'Biplanos foram os primeiros aviões da história!'
    },
    mat: {
      title: 'Dobro de asas',
      text: 'Se um biplano tem 2 asas e um monoplano tem 1:',
      q: 'Quantas asas têm 4 biplanos juntos?',
      a: '8 asas! (4 × 2)'
    },
    por: {
      title: 'Asa de Cima',
      syllables: [
        { s: 'A', v: true },
        { s: 'SA', v: true }
      ],
      classe: 'Substantivo feminino',
      family: ['aseiro', 'asinha'],
      sentence: 'A asa de cima fica mais alta.'
    },
    eng: {
      title: 'Top Wing in English',
      word: 'Top Wing',
      pron: 'TÓP UÍNG',
      sentence: 'The top wing is yellow.',
      translation: 'A asa de cima é amarela.'
    }
  },

  'wing-bottom': {
    emoji: '🪽',
    name: 'Asa de Baixo',
    nameEn: 'Bottom Wing',
    pron: 'BÓ-tom UÍNG',
    ipa: '/ˈbɒtəm wɪŋ/',
    sci: {
      title: 'A asa que segura',
      text: 'A asa de baixo dá estabilidade ao biplano.',
      fact: 'Sem a asa de baixo, o biplano ficaria instável.'
    },
    mat: {
      title: 'Posição',
      text: 'A asa de baixo fica 0,9 metros abaixo da de cima.',
      q: 'Se a de cima está a 1,15m, onde está a de baixo?',
      a: 'A 0,25m! (1,15 − 0,9)'
    },
    por: {
      title: 'Asa de Baixo',
      syllables: [
        { s: 'BAI', v: true },
        { s: 'XO', v: true }
      ],
      classe: 'Adjetivo + substantivo',
      family: ['baixinho', 'rebaixar'],
      sentence: 'A asa de baixo é amarela.'
    },
    eng: {
      title: 'Bottom Wing in English',
      word: 'Bottom Wing',
      pron: 'BÓ-tom UÍNG',
      sentence: 'The bottom wing is yellow.',
      translation: 'A asa de baixo é amarela.'
    }
  }
};
