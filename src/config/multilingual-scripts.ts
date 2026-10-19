/**
 * Multilingual Viral Scripts & Keyword Mappings for AI Text to Video Studio
 * Supports 8 global and regional languages: English, Urdu, Hindi, Spanish, Arabic, French, German, and Portuguese.
 */

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechPrefix: string;
  dir: "ltr" | "rtl";
}

export interface MultilingualPreset {
  id: string;
  category: string;
  title: string;
  badge: string;
  script: string;
}

export const MULTILINGUAL_LANGUAGES: LanguageOption[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    speechPrefix: "en",
    dir: "ltr",
  },
  {
    code: "ur",
    name: "Urdu",
    nativeName: "اردو",
    flag: "🇵🇰",
    speechPrefix: "ur",
    dir: "rtl",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "🇮🇳",
    speechPrefix: "hi",
    dir: "ltr",
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    speechPrefix: "es",
    dir: "ltr",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    speechPrefix: "ar",
    dir: "rtl",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    speechPrefix: "fr",
    dir: "ltr",
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    speechPrefix: "de",
    dir: "ltr",
  },
  {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    flag: "🇧🇷",
    speechPrefix: "pt",
    dir: "ltr",
  },
];

export const MULTILINGUAL_VIRAL_PRESETS: Record<string, MultilingualPreset[]> = {
  en: [
    {
      id: "en-lamborghini-quote",
      category: "Wealth & Mindset 🏎️",
      title: "Crying in a Lamborghini",
      badge: "Viral Trend",
      script:
        "Money can’t buy real happiness.\nBut have you ever cried in a Lamborghini?\nWork hard until luxury becomes your standard.",
    },
    {
      id: "en-ancient-mystery",
      category: "Stories & Mysteries 🏰",
      title: "Old Village Mysteries",
      badge: "Storytelling",
      script:
        "Deep inside an ancient forgotten village.\nOld mysteries whisper through empty roads.\nA fearless lion roams in the shadows.",
    },
    {
      id: "en-struggle-growth",
      category: "Mindset & Growth 🌱",
      title: "Struggle & Learning Progress",
      badge: "Trending",
      script:
        "You may struggle along the way.\nBut every step is teaching you.\nTrust yourself and keep moving.",
    },
    {
      id: "en-reach-the-top",
      category: "Mindset & Grind 🔥",
      title: "Stop Waiting & Start Now",
      badge: "Viral Motivational",
      script:
        "Stop waiting for the perfect moment.\nStart now, even if it’s difficult.\nLearn from every mistake.\nYour future begins with one step.",
    },
    {
      id: "en-space-secrets",
      category: "Space & Science 🚀",
      title: "Crazy Space Facts That Sound Fake",
      badge: "Viral Sci-Fi",
      script:
        "Did you know that in space, there is a giant cloud of alcohol spanning 463 billion kilometers?\nAnd on Neptune, it literally rains solid diamonds!",
    },
  ],

  ur: [
    {
      id: "ur-wealth-mindset",
      category: "دولت اور عزم 🏎️",
      title: "لیمبورگینی اور کامیابی",
      badge: "وائرل موٹیویشن",
      script:
        "پیسہ سچی خوشی نہیں خرید سکتا۔\nلیکن کیا آپ نے کبھی لیمبورگینی میں بیٹھ کر آنسو بہائے ہیں؟\nاتنی محنت کرو کہ شاندار زندگی آپ کا معیار بن جائے۔",
    },
    {
      id: "ur-ancient-village",
      category: "کہانیاں اور اسرار 🏰",
      title: "قدیم پراسرار گاؤں",
      badge: "دلچسپ کہانی",
      script:
        "ایک قدیم اور ویران گاؤں کے سناٹے میں۔\nخالی سڑکوں پر گمنام پرانی سرگوشیاں گونجتی ہیں۔\nاور اندھیرے میں ایک نڈر اور طاقتور شیر گھومتا ہے۔",
    },
    {
      id: "ur-struggle-success",
      category: "ہمت اور محنت 🌱",
      title: "مشکلات اور ترقی",
      badge: "ٹرینڈنگ سوچ",
      script:
        "راستے میں گرنا اور تھکنا فطری بات ہے۔\nلیکن ہر ٹھوکر آپ کو کچھ نیا سکھاتی ہے۔\nاپنے اوپر یقین رکھو اور کبھی ہار مت مانو۔",
    },
    {
      id: "ur-stop-waiting",
      category: "آج ہی شروعات کرو 🔥",
      title: "صحیح وقت کا انتظار چھوڑو",
      badge: "سبق آموز",
      script:
        "کبھی مناسب وقت کے انتظار میں وقت ضائع مت کرو۔\nآج ہی آغاز کرو، چاہے راستہ کتنا ہی کٹھن ہو۔\nتمہارا شاندار کل تمہارے آج کے فیصلے سے بنتا ہے۔",
    },
    {
      id: "ur-space-facts",
      category: "خلائی راز 🚀",
      title: "کائنات کے سحر انگیز حقائق",
      badge: "سائنس اور سچائی",
      script:
        "کیا آپ جانتے ہیں کہ ہمارے نظامِ شمسی کے نیپچون سیارے پر ہیروں کی بارش ہوتی ہے؟\nاور خلا میں روشنی کی رفتار سے گھومتے ہوئے ستاروں کا سمندر بہتا ہے!",
    },
  ],

  hi: [
    {
      id: "hi-wealth-mindset",
      category: "दौलत और सोच 🏎️",
      title: "लैम्बोर्गिनी और कामयाबी",
      badge: "वायरल ट्रेंड",
      script:
        "पैसा सच्ची खुशी नहीं खरीद सकता।\nलेकिन क्या आप कभी लैम्बोर्गिनी में रोए हैं?\nइतनी मेहनत करो कि लक्ज़री तुम्हारी आदत बन जाए।",
    },
    {
      id: "hi-village-mystery",
      category: "कहानियां और रहस्य 🏰",
      title: "पुराने गांव का अनसुलझा रहस्य",
      badge: "स्टोरीटेलिंग",
      script:
        "एक प्राचीन और वीरान गांव के सन्नाटे में।\nखाली रास्तों से पुरानी दास्तानों की फुसफुसाहट आती है।\nऔर रात के अंधेरे में एक निडर शेर दहाड़ता है।",
    },
    {
      id: "hi-struggle-success",
      category: "संघर्ष और विकास 🌱",
      title: "हार मत मानो, आगे बढ़ो",
      badge: "मोटिवेशन",
      script:
        "सफ़र में मुश्किलें तो आएंगी ही।\nलेकिन हर ठोकर तुम्हें एक नया सबक सिखाती है।\nखुद पर अटूट भरोसा रखो और आगे बढ़ते रहो।",
    },
    {
      id: "hi-start-now",
      category: "आज से शुरुआत 🔥",
      title: "सही मौके का इंतज़ार छोड़ो",
      badge: "लाइफ चेंजिंग",
      script:
        "सही समय का इंतज़ार करना बंद करो।\nआज से ही शुरुआत करो, चाहे रास्ता कितना भी कठिन क्यों न हो।\nतुम्हारा कल आज के पहले कदम से शुरू होता है।",
    },
    {
      id: "hi-space-facts",
      category: "अंतरिक्ष के रहस्य 🚀",
      title: "ब्रह्मांड के हैरतअंगेज़ सच",
      badge: "साइंस फैक्ट्स",
      script:
        "क्या आप जानते हैं कि नेप्च्यून ग्रह पर सचमुच हीरों की बारिश होती है?\nऔर अंतरिक्ष में तैरता हुआ एक विशाल पानी का महासागर मौजूद है!",
    },
  ],

  es: [
    {
      id: "es-wealth-mindset",
      category: "Riqueza y Éxito 🏎️",
      title: "Llorar en un Lamborghini",
      badge: "Tendencia Viral",
      script:
        "El dinero no compra la felicidad real.\n¿Pero alguna vez has llorado dentro de un Lamborghini?\nTrabaja duro hasta que el lujo sea tu estándar diario.",
    },
    {
      id: "es-village-mystery",
      category: "Historias y Misterios 🏰",
      title: "Misterios del Pueblo Antiguo",
      badge: "Misterio",
      script:
        "En lo profundo de un antiguo pueblo olvidado.\nLos viejos misterios susurran por caminos vacíos.\nY un león valiente vigila entre las sombras.",
    },
    {
      id: "es-growth-discipline",
      category: "Superación y Crecimiento 🌱",
      title: "Disciplina y Progreso",
      badge: "Motivación",
      script:
        "Puede que tropieces en el camino.\nPero cada caída te hace más fuerte y sabio.\nConfía en ti mismo y nunca te detengas.",
    },
    {
      id: "es-start-now",
      category: "Acción y Futuro 🔥",
      title: "Deja de Esperar el Momento",
      badge: "Alta Retención",
      script:
        "Deja de esperar el momento perfecto.\nEmpieza ahora, incluso si el camino es difícil.\nTu futuro brillante comienza con un solo paso.",
    },
    {
      id: "es-space-facts",
      category: "Espacio y Universo 🚀",
      title: "Secretos Increíbles del Cosmos",
      badge: "Curiosidades",
      script:
        "¿Sabías que en el planeta Neptuno llueven diamantes sólidos reales?\nEl universo infinito esconde maravillas que desafían la imaginación.",
    },
  ],

  ar: [
    {
      id: "ar-wealth-mindset",
      category: "الثروة والنجاح 🏎️",
      title: "البكاء في سيارة لامبورغيني",
      badge: "تريند تحفيزي",
      script:
        "المال لا يشتري السعادة الحقيقية.\nولكن هل بكيت يومًا وأنت تقود لامبورغيني؟\nاعمل بجد حتى تصبح الرفاهية أسلوب حياتك الطبيعي.",
    },
    {
      id: "ar-village-mystery",
      category: "قصص وأسرار 🏰",
      title: "أسرار القرية القديمة المهجورة",
      badge: "غموض وتشويق",
      script:
        "في أعماق قرية قديمة غارقة في الصمت والنسيان.\nتهمس الأسرار القديمة عبر الدروب الخالية.\nوأسد شجاع مهيب يجوب الظلال بلا خوف.",
    },
    {
      id: "ar-growth-mindset",
      category: "الإصرار والعزيمة 🌱",
      title: "العقبات تصنع الأبطال",
      badge: "حكمة يومية",
      script:
        "قد تواجه الكثير من الصعوبات في طريقك.\nولكن تذكر دائمًا أن كل درس يجعلك أقوى من قبل.\nثق بقدراتك اللامحدودة وواصل المسير.",
    },
    {
      id: "ar-start-now",
      category: "ابدأ اليوم 🔥",
      title: "لا تنتظر اللحظة المثالية",
      badge: "طاقة إيجابية",
      script:
        "توقف عن انتظار اللحظة المناسبة للبدء.\nابدأ الآن فورًا مهما كانت البدايات صعبة.\nمستقبلك العظيم يبدأ بخطوة شجاعة واحدة.",
    },
    {
      id: "ar-space-facts",
      category: "عجائب الفضاء 🚀",
      title: "حقائق كونية مذهلة",
      badge: "علوم وفلك",
      script:
        "هل تعلم أن السماء تمطر ألماساً حقيقياً خالصاً على كوكب نبتون؟\nوأن الفضاء الخارجي يحتوي على سحب مائية عملاقة تفوق كل محيطات الأرض!",
    },
  ],

  fr: [
    {
      id: "fr-wealth-mindset",
      category: "Succès et Ambition 🏎️",
      title: "Pleurer dans une Lamborghini",
      badge: "Tendance Virale",
      script:
        "L'argent ne fait pas le bonheur réel.\nMais avez-vous déjà pleuré au volant d'une Lamborghini ?\nTravaillez avec acharnement jusqu'à ce que le luxe devienne votre quotidien.",
    },
    {
      id: "fr-village-mystery",
      category: "Mystères et Légendes 🏰",
      title: "Le Secret du Vieux Village",
      badge: "Histoire Mystérieuse",
      script:
        "Au cœur d'un vieux village oublié du monde.\nDe sombres mystères murmurent sur les routes désertes.\nUn lion fier et sans peur règne dans l'ombre.",
    },
    {
      id: "fr-growth-mindset",
      category: "Dépassement de Soi 🌱",
      title: "Chaque Pas Compte",
      badge: "Motivation",
      script:
        "Vous rencontrerez des obstacles sur votre chemin.\nMais chaque épreuve vous rend plus fort et plus sage.\nCroyez en votre destin et avancez sans hésiter.",
    },
    {
      id: "fr-start-now",
      category: "Passez à l'Action 🔥",
      title: "N'attendez Plus Jamais",
      badge: "Viral Shorts",
      script:
        "Cessez d'attendre le moment parfait.\nCommencez maintenant, même si la montagne semble haute.\nVotre futur commence aujourd'hui par une décision.",
    },
    {
      id: "fr-space-facts",
      category: "Mystères de l'Espace 🚀",
      title: "Faits Cosmiques Incroyables",
      badge: "Science & Découverte",
      script:
        "Saviez-vous que sur la planète Neptune, il pleut littéralement de vrais diamants ?\nL'univers regorge de merveilles qui dépassent notre imagination.",
    },
  ],

  de: [
    {
      id: "de-wealth-mindset",
      category: "Erfolg & Wohlstand 🏎️",
      title: "Weinen im Lamborghini",
      badge: "Viral Trend",
      script:
        "Geld kauft kein wahres Glück.\nAber hast du jemals in einem Lamborghini geweint?\nArbeite hart, bis außergewöhnlicher Luxus dein Standard wird.",
    },
    {
      id: "de-village-mystery",
      category: "Mythen & Geheimnisse 🏰",
      title: "Geheimnisse des Alten Dorfes",
      badge: "Spannende Story",
      script:
        "Tief in einem alten, vergessenen Bergdorf.\nUralte Geheimnisse flüstern über verlassene Straßen.\nUnd ein furchtloser Löwe wandert durch die Schatten.",
    },
    {
      id: "de-growth-mindset",
      category: "Disziplin & Stärke 🌱",
      title: "Aus Rückschlägen Wachsen",
      badge: "Inspiration",
      script:
        "Du wirst auf deinem Lebensweg Fehler machen.\nAber jeder Fehltritt ist eine wertvolle Lektion fürs Leben.\nVertraue auf deine Fähigkeiten und bleib am Ball.",
    },
    {
      id: "de-start-now",
      category: "Jetzt Starten 🔥",
      title: "Warte Nicht auf Morgen",
      badge: "Motivation",
      script:
        "Warte nicht auf den perfekten Moment.\nFang heute an, auch wenn der Anfang schwerfällt.\nDeine Zukunft beginnt mit einem einzigen entschlossenen Schritt.",
    },
    {
      id: "de-space-facts",
      category: "Universum & Kosmos 🚀",
      title: "Verrückte Fakten aus dem All",
      badge: "Wissenschaft",
      script:
        "Wusstest du, dass es auf dem Planeten Neptun echte feste Diamanten regnet?\nDas Universum birgt unendliche Wunder von gigantischem Ausmaß.",
    },
  ],

  pt: [
    {
      id: "pt-wealth-mindset",
      category: "Riqueza & Foco 🏎️",
      title: "Chorar em uma Lamborghini",
      badge: "Viral do Momento",
      script:
        "Dinheiro não compra felicidade de verdade.\nMas você já chorou dentro de uma Lamborghini?\nTrabalhe duro até o luxo se tornar o seu padrão diário.",
    },
    {
      id: "pt-village-mystery",
      category: "Mistérios e Histórias 🏰",
      title: "Os Segredos da Antiga Vila",
      badge: "Suspense",
      script:
        "Nas profundezas de uma vila antiga e esquecida.\nMistérios sussurram através das estradas vazias.\nE um leão destemido vigia na escuridão.",
    },
    {
      id: "pt-growth-mindset",
      category: "Evolução e Garra 🌱",
      title: "Nunca Desista da Jornada",
      badge: "Motivação",
      script:
        "Você vai enfrentar desafios pelo caminho.\nMas lembre-se: cada tropeço te torna muito mais forte.\nAcredite no seu potencial e siga em frente.",
    },
    {
      id: "pt-start-now",
      category: "Comece Hoje 🔥",
      title: "Pare de Esperar o Momento",
      badge: "Foco Total",
      script:
        "Pare de esperar pelo momento ideal para agir.\nComece agora mesmo, mesmo que o início seja difícil.\nO seu grande futuro começa com um simples passo.",
    },
    {
      id: "pt-space-facts",
      category: "Espaço e Universo 🚀",
      title: "Fatos Espaciais Impressionantes",
      badge: "Curiosidades",
      script:
        "Você sabia que no planeta Netuno chove diamantes sólidos de verdade?\nO cosmos infinito guarda segredos que parecem pura ficção científica.",
    },
  ],
};

/**
 * Multilingual Word to Visual Keyword Dictionary
 * Automatically maps tokens in Urdu, Hindi, Spanish, Arabic, French, German, and Portuguese
 * to high-value English stock keywords for Pexels, Openverse, and Curated visuals.
 */
const MULTILINGUAL_KEYWORD_MAP: Array<{ tokens: string[]; target: string }> = [
  // Supercar / Lamborghini / Speed
  {
    tokens: [
      "lamborghini", "ferrari", "supercar", "car", "sports car",
      "لیمبورگینی", "گاڑی", "کار", "سوپرکار", "رفتار",
      "लैम्बोर्गिनी", "गाड़ी", "कार", "रफ्तार",
      "coche", "carro", "automóvil", "velocidad",
      "سيارة", "لامبورغيني", "سرعة",
      "voiture", "automobile", "vitesse",
      "auto", "wagen", "geschwindigkeit",
    ],
    target: "lamborghini",
  },

  // Money, Gold, Luxury, Wealth
  {
    tokens: [
      "money", "luxury", "standard", "wealth", "gold", "crypto",
      "پیسہ", "دولت", "عیش", "امیر", "سونا", "خوشی",
      "पैसा", "दौलत", "धन", "लक्ज़री", "सोना", "अमीर",
      "dinero", "lujo", "riqueza", "oro",
      "المال", "الثروة", "ذهب", "غنى", "رفاهية",
      "argent", "richesse", "luxe", "or",
      "geld", "luxus", "wohlstand", "gold",
    ],
    target: "money",
  },

  // Village, Castle, Ruins, Mystery
  {
    tokens: [
      "village", "ancient", "ruins", "castle", "mystery", "forgotten",
      "گاؤں", "قدیم", "ویران", "اسرار", "قلعہ",
      "गांव", "गाँव", "प्राचीन", "रहस्य", "किला",
      "pueblo", "antiguo", "ruinas", "castillo", "misterio",
      "قرية", "قديمة", "أسرار", "قلعة", "مهجورة",
      "village", "ruines", "château", "mystère",
      "dorf", "ruinen", "burg", "geheimnis",
    ],
    target: "village",
  },

  // Lion, Predator, Wilderness, Shadows
  {
    tokens: [
      "lion", "tiger", "animal", "shadows", "fearless",
      "شیر", "جانور", "طاقتور", "خاموشی",
      "शेर", "जानवर", "साहसी", "दहाड़ता",
      "león", "animal", "sombras", "salvaje",
      "أسد", "حيوان", "ظلال", "شجاع",
      "lion", "ombre", "sauvage",
      "löwe", "tier", "schatten",
    ],
    target: "lion",
  },

  // Space, Galaxy, Stars, Diamonds, Neptune
  {
    tokens: [
      "space", "neptune", "diamonds", "galaxy", "universe", "stars",
      "خلا", "نیپچون", "ہیرے", "کائنات", "سیارے", "ستاروں",
      "अंतरिक्ष", "नेप्च्यून", "हीरे", "ब्रह्मांड", "सितारे",
      "espacio", "universo", "neptuno", "diamantes", "estrellas",
      "فضاء", "كون", "نبتون", "ألماسا", "نجوم", "كوكب",
      "espace", "univers", "diamants", "étoiles",
      "weltall", "kosmos", "diamanten", "sterne",
    ],
    target: "space",
  },

  // Workout, Struggle, Gym, Grit, Strength
  {
    tokens: [
      "struggle", "difficult", "hard", "grind", "grit", "workout", "gym", "muscle",
      "مشکل", "محنت", "ہمت", "ٹھوکر", "مضبوط",
      "मुश्किल", "मेहनत", "कठिन", "संघर्ष", "ठोकर",
      "lucha", "difícil", "esfuerzo", "fuerza", "disciplina",
      "صعوبة", "إصرار", "عزيمة", "جهد",
      "effort", "combat", "discipline", "force",
      "mühe", "kampf", "disziplin", "training",
    ],
    target: "grit-workout",
  },

  // Learning, Books, Wisdom, Mistakes
  {
    tokens: [
      "learn", "teaching", "mistake", "lesson", "wisdom", "book", "knowledge",
      "سیکھنا", "علم", "سبق", "کتاب", "یقین",
      "सीखना", "ज्ञान", "सबक", "किताब", "भरोसा",
      "aprender", "lección", "sabiduría", "libro",
      "حكمة", "تعلم", "كتاب", "درس",
      "apprendre", "leçon", "sagesse", "livre",
      "lernen", "weisheit", "buch", "wissen",
    ],
    target: "wisdom-books",
  },

  // Road, Highway, Future, Steps, Beginning
  {
    tokens: [
      "future", "step", "road", "highway", "horizon", "destination", "begins",
      "راستہ", "سڑک", "قدم", "مستقبل", "آغاز",
      "सफ़र", "रास्ता", "सड़क", "कदम", "शुरुआत",
      "camino", "carretera", "paso", "futuro",
      "طريق", "خطوة", "مستقبل", "بداية",
      "chemin", "route", "futur", "début",
      "weg", "straße", "schritt", "zukunft",
    ],
    target: "future-horizon",
  },

  // Mountain, Top, Summit, Victory
  {
    tokens: [
      "top", "summit", "mountain", "peak", "victory", "sky",
      "پہاڑ", "چوٹی", "بلندی", "کامیابی",
      "पहाड़", "चोटी", "शिखर", "सफलता",
      "montaña", "cumbre", "pico", "victoria",
      "جبل", "قمة", "نصر", "سماء",
      "montagne", "sommet", "victoire",
      "berg", "gipfel", "sieg",
    ],
    target: "mountain-summit",
  },

  // Time, Clock, Waiting, Hourglass
  {
    tokens: [
      "time", "clock", "waiting", "moment", "patience", "delay",
      "وقت", "گھڑی", "انتظار", "لمحہ", "ضائع",
      "समय", "वक्त", "घड़ी", "इंतज़ार", "पल",
      "tiempo", "reloj", "esperar", "momento",
      "وقت", "ساعة", "انتظار", "لحظة",
      "temps", "horloge", "attente", "moment",
      "zeit", "uhr", "warten", "augenblick",
    ],
    target: "time-hourglass",
  },
];

/**
 * Detects multilingual subjects in a sentence and returns the matching visual keyword target.
 */
export function getMultilingualSearchTerm(sentence: string): string | null {
  if (!sentence) return null;
  const lower = sentence.toLowerCase();

  for (const group of MULTILINGUAL_KEYWORD_MAP) {
    for (const token of group.tokens) {
      if (lower.includes(token)) {
        return group.target;
      }
    }
  }

  return null;
}
