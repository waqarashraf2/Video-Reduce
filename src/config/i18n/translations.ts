import { SupportedLocale } from "./locales";

export interface UiTranslations {
  home: string;
  convert: string;
  compress: string;
  tools: string;
  inBrowserPrivate: string;
  noServerUpload: string;
  zeroServerCost: string;
  howToConvert: string;
  howToCompress: string;
  whyConvertTitle: string;
  whyCompressTitle: string;
  techSpecsTitle: string;
  faqTitle: string;
  vsFreeConvertTitle: string;
  vsFreeConvertSubtitle: string;
  videoReduceAdvantage: string;
  freeConvertComparison: {
    feature: string;
    videoReduce: string;
    freeConvert: string;
  }[];
  selectFile: string;
  step1: string;
  step2: string;
  step3: string;
  targetLimit: string;
  recommendedPreset: string;
  loadingEngine: string;
}

export const UI_TRANSLATIONS: Record<SupportedLocale, UiTranslations> = {
  en: {
    home: "Home",
    convert: "Convert",
    compress: "Compress",
    tools: "Tools",
    inBrowserPrivate: "100% In-Browser Transcode",
    noServerUpload: "0 Bytes Uploaded to Cloud",
    zeroServerCost: "0 Server Cost • Unlimited",
    howToConvert: "How to Convert",
    howToCompress: "How to Compress",
    whyConvertTitle: "Why Convert",
    whyCompressTitle: "Why Pre-Compressing Matters",
    techSpecsTitle: "Technical Format Specifications",
    faqTitle: "Frequently Asked Questions",
    vsFreeConvertTitle: "VideoReduce vs Cloud Converters (FreeConvert)",
    vsFreeConvertSubtitle: "Why client-side WebAssembly beats legacy server upload tools in 2026",
    videoReduceAdvantage: "100% Private & Instant",
    freeConvertComparison: [
      {
        feature: "Upload Wait Time",
        videoReduce: "0 Seconds (Processes in Local RAM)",
        freeConvert: "Slow Cloud Upload (Bottlenecked by internet)",
      },
      {
        feature: "Privacy & Security",
        videoReduce: "100% Private (Files never leave device)",
        freeConvert: "Files saved on third-party cloud servers",
      },
      {
        feature: "File Size Limits",
        videoReduce: "Unlimited (Handles 1GB to 10GB+)",
        freeConvert: "Strict 1GB limit without paid subscription",
      },
      {
        feature: "Queue & Ads",
        videoReduce: "Instant Processing (No queue)",
        freeConvert: "Slow processing queues & heavy ads",
      },
    ],
    selectFile: "Select Video File",
    step1: "Select File",
    step2: "Configure Settings",
    step3: "Download & Save",
    targetLimit: "Target Limit:",
    recommendedPreset: "Recommended Preset:",
    loadingEngine: "Loading Converter Engine...",
  },
  es: {
    home: "Inicio",
    convert: "Convertir",
    compress: "Comprimir",
    tools: "Herramientas",
    inBrowserPrivate: "100% Privado en el Navegador",
    noServerUpload: "0 Bytes Subidos a la Nube",
    zeroServerCost: "Sin Costo de Servidor • Ilimitado",
    howToConvert: "Cómo Convertir",
    howToCompress: "Cómo Comprimir",
    whyConvertTitle: "Por Qué Convertir",
    whyCompressTitle: "Por Qué Importa la Compresión Previa",
    techSpecsTitle: "Especificaciones Técnicas",
    faqTitle: "Preguntas Frecuentes",
    vsFreeConvertTitle: "VideoReduce vs Convertidores en la Nube (FreeConvert)",
    vsFreeConvertSubtitle: "Por qué WebAssembly local supera a los convertidores tradicionales en 2026",
    videoReduceAdvantage: "100% Privado e Instantáneo",
    freeConvertComparison: [
      {
        feature: "Tiempo de Subida",
        videoReduce: "0 Segundos (Procesa en Memoria RAM Local)",
        freeConvert: "Subida Lenta a la Nube (Depende de tu conexión)",
      },
      {
        feature: "Privacidad y Seguridad",
        videoReduce: "100% Privado (Tus archivos nunca salen de tu equipo)",
        freeConvert: "Archivos almacenados en servidores de terceros",
      },
      {
        feature: "Límite de Tamaño de Archivo",
        videoReduce: "Sin Límites (Procesa de 1GB a más de 10GB)",
        freeConvert: "Límites estrictos sin suscripción de pago",
      },
      {
        feature: "Colas y Esperas",
        videoReduce: "Procesamiento Inmediato (Sin colas)",
        freeConvert: "Colas de espera y anuncios molestos",
      },
    ],
    selectFile: "Seleccionar Archivo de Video",
    step1: "Seleccionar Archivo",
    step2: "Ajustar Configuración",
    step3: "Descargar y Guardar",
    targetLimit: "Límite Objetivo:",
    recommendedPreset: "Ajuste Recomendado:",
    loadingEngine: "Cargando Motor de Conversión...",
  },
  pt: {
    home: "Início",
    convert: "Converter",
    compress: "Comprimir",
    tools: "Ferramentas",
    inBrowserPrivate: "100% Privado no Navegador",
    noServerUpload: "0 Bytes Enviados para Nuvem",
    zeroServerCost: "Sem Custo de Servidor • Ilimitado",
    howToConvert: "Como Converter",
    howToCompress: "Como Comprimir",
    whyConvertTitle: "Por Que Converter",
    whyCompressTitle: "Por Que a Pré-Compressão é Importante",
    techSpecsTitle: "Especificações Técnicas",
    faqTitle: "Perguntas Frequentes",
    vsFreeConvertTitle: "VideoReduce vs Conversores na Nuvem (FreeConvert)",
    vsFreeConvertSubtitle: "Por que o WebAssembly local supera os conversores em nuvem em 2026",
    videoReduceAdvantage: "100% Privado e Instantâneo",
    freeConvertComparison: [
      {
        feature: "Tempo de Espera de Upload",
        videoReduce: "0 Segundos (Processa na Memória RAM Local)",
        freeConvert: "Upload Lento na Nuvem (Limitado pela internet)",
      },
      {
        feature: "Privacidade e Segurança",
        videoReduce: "100% Privado (Arquivos nunca saem do seu dispositivo)",
        freeConvert: "Arquivos salvos em servidores de terceiros",
      },
      {
        feature: "Limites de Tamanho",
        videoReduce: "Ilimitado (Processa de 1GB a mais de 10GB)",
        freeConvert: "Limite rígido de 1GB sem plano pago",
      },
      {
        feature: "Filas de Espera",
        videoReduce: "Processamento Imediato (Sem filas)",
        freeConvert: "Filas lentas e anúncios excessivos",
      },
    ],
    selectFile: "Selecionar Arquivo de Vídeo",
    step1: "Selecionar Arquivo",
    step2: "Configurar Ajustes",
    step3: "Baixar e Salvar",
    targetLimit: "Limite Alvo:",
    recommendedPreset: "Predefinição Recomendada:",
    loadingEngine: "Carregando Motor de Conversão...",
  },
  fr: {
    home: "Accueil",
    convert: "Convertir",
    compress: "Compresser",
    tools: "Outils",
    inBrowserPrivate: "100% Privé dans le Navigateur",
    noServerUpload: "0 Octet Téléchargé sur Serveur",
    zeroServerCost: "Zéro Coût Serveur • Illimité",
    howToConvert: "Comment Convertir",
    howToCompress: "Comment Compresser",
    whyConvertTitle: "Pourquoi Convertir",
    whyCompressTitle: "Pourquoi la Pré-Compression est Importante",
    techSpecsTitle: "Spécifications Techniques",
    faqTitle: "Foire Aux Questions",
    vsFreeConvertTitle: "VideoReduce vs Convertisseurs Cloud (FreeConvert)",
    vsFreeConvertSubtitle: "Pourquoi le WebAssembly local surpasse les outils serveur en 2026",
    videoReduceAdvantage: "100% Privé & Instantané",
    freeConvertComparison: [
      {
        feature: "Temps d'attente d'upload",
        videoReduce: "0 Seconde (Traitement dans la RAM locale)",
        freeConvert: "Upload lent vers le Cloud (dépendant de la connexion)",
      },
      {
        feature: "Confidentialité & Sécurité",
        videoReduce: "100% Privé (Les fichiers ne quittent jamais votre appareil)",
        freeConvert: "Fichiers stockés sur des serveurs tiers",
      },
      {
        feature: "Limites de Taille de Fichier",
        videoReduce: "Illimité (Traite de 1 Go à plus de 10 Go)",
        freeConvert: "Limite stricte de 1 Go sans abonnement payant",
      },
      {
        feature: "File d'attente",
        videoReduce: "Traitement Instantané (Pas de file d'attente)",
        freeConvert: "Files d'attente lentes et publicités",
      },
    ],
    selectFile: "Sélectionner le Fichier Vidéo",
    step1: "Sélectionner le Fichier",
    step2: "Ajuster les Paramètres",
    step3: "Télécharger & Enregistrer",
    targetLimit: "Limite Cible :",
    recommendedPreset: "Préréglage Recommandé :",
    loadingEngine: "Chargement du Moteur de Conversion...",
  },
  de: {
    home: "Startseite",
    convert: "Konvertieren",
    compress: "Komprimieren",
    tools: "Werkzeuge",
    inBrowserPrivate: "100% Privat im Browser",
    noServerUpload: "0 Bytes auf Server Hochgeladen",
    zeroServerCost: "Keine Serverkosten • Unbegrenzt",
    howToConvert: "So Konvertieren Sie",
    howToCompress: "So Komprimieren Sie",
    whyConvertTitle: "Warum Konvertieren",
    whyCompressTitle: "Warum Vorkomprimierung Wichtig Ist",
    techSpecsTitle: "Technische Formatspezifikationen",
    faqTitle: "Häufig Gestellte Fragen (FAQ)",
    vsFreeConvertTitle: "VideoReduce vs Cloud-Konverter (FreeConvert)",
    vsFreeConvertSubtitle: "Warum lokales WebAssembly herkömmliche Cloud-Uploads 2026 übertrifft",
    videoReduceAdvantage: "100% Privat & Sofort",
    freeConvertComparison: [
      {
        feature: "Upload-Wartezeit",
        videoReduce: "0 Sekunden (Verarbeitung im lokalen RAM)",
        freeConvert: "Langsamer Cloud-Upload (Abhängig von Internetverbindung)",
      },
      {
        feature: "Datenschutz & Sicherheit",
        videoReduce: "100% Privat (Dateien verlassen niemals Ihr Gerät)",
        freeConvert: "Dateien werden auf Drittservern gespeichert",
      },
      {
        feature: "Dateigrößenbeschränkung",
        videoReduce: "Unbegrenzt (Verarbeitet 1 GB bis über 10 GB)",
        freeConvert: "Striktes 1-GB-Limit ohne kostenpflichtiges Abo",
      },
      {
        feature: "Warteschlangen",
        videoReduce: "Sofortige Verarbeitung (Keine Warteschlange)",
        freeConvert: "Lange Warteschlangen & störende Werbung",
      },
    ],
    selectFile: "Videodatei Auswählen",
    step1: "Datei Auswählen",
    step2: "Einstellungen Anpassen",
    step3: "Herunterladen & Speichern",
    targetLimit: "Ziellimit:",
    recommendedPreset: "Empfohlene Voreinstellung:",
    loadingEngine: "Konverter-Engine Wird Geladen...",
  },
  it: {
    home: "Home",
    convert: "Converti",
    compress: "Comprimi",
    tools: "Strumenti",
    inBrowserPrivate: "100% Privato nel Browser",
    noServerUpload: "0 Byte Caricati sul Cloud",
    zeroServerCost: "Zero Costi Server • Illimitato",
    howToConvert: "Come Convertire",
    howToCompress: "Come Comprimere",
    whyConvertTitle: "Perché Convertire",
    whyCompressTitle: "Perché la Pre-Compressione è Importante",
    techSpecsTitle: "Specifiche Tecniche del Formato",
    faqTitle: "Domande Frequenti (FAQ)",
    vsFreeConvertTitle: "VideoReduce vs Convertitori Cloud (FreeConvert)",
    vsFreeConvertSubtitle: "Perché il WebAssembly locale supera i convertitori su server nel 2026",
    videoReduceAdvantage: "100% Privato e Istantaneo",
    freeConvertComparison: [
      {
        feature: "Tempo di Caricamento",
        videoReduce: "0 Secondi (Elaborazione nella RAM Locale)",
        freeConvert: "Upload lento sul Cloud (Vincolato dalla rete)",
      },
      {
        feature: "Privacy e Sicurezza",
        videoReduce: "100% Privato (I file non lasciano mai il dispositivo)",
        freeConvert: "File archiviati su server cloud di terze parti",
      },
      {
        feature: "Limiti di Dimensione File",
        videoReduce: "Illimitato (Elabora da 1GB a oltre 10GB)",
        freeConvert: "Limite rigido di 1GB senza abbonamento",
      },
      {
        feature: "Code e Pubblicità",
        videoReduce: "Elaborazione Immediata (Senza code)",
        freeConvert: "Code di attesa lente e annunci invasivi",
      },
    ],
    selectFile: "Seleziona File Video",
    step1: "Seleziona File",
    step2: "Configura Impostazioni",
    step3: "Scarica e Salva",
    targetLimit: "Limite Obiettivo:",
    recommendedPreset: "Preimpostazione Consigliata:",
    loadingEngine: "Caricamento Motore di Conversione...",
  },
  hi: {
    home: "होम",
    convert: "कन्वर्ट करें",
    compress: "कंप्रेस करें",
    tools: "टूल्स",
    inBrowserPrivate: "100% ब्राउज़र में निजी ट्रांसकोड",
    noServerUpload: "क्लाउड पर 0 बाइट्स अपलोड",
    zeroServerCost: "मुफ्त और असीमित फाइल साइज",
    howToConvert: "कन्वर्ट कैसे करें",
    howToCompress: "कंप्रेस कैसे करें",
    whyConvertTitle: "कन्वर्ट क्यों करें",
    whyCompressTitle: "वीडियो कंप्रेस करना क्यों जरूरी है",
    techSpecsTitle: "तकनीकी फॉर्मेट विनिर्देश",
    faqTitle: "अक्सर पूछे जाने वाले सवाल (FAQ)",
    vsFreeConvertTitle: "VideoReduce बनाम ऑनलाइन क्लाउड कन्वर्टर्स (FreeConvert)",
    vsFreeConvertSubtitle: "2026 में स्थानीय WebAssembly सर्वर अपलोड से बेहतर क्यों है",
    videoReduceAdvantage: "100% निजी और तुरंत",
    freeConvertComparison: [
      {
        feature: "अपलोड प्रतीक्षा समय",
        videoReduce: "0 सेकंड (स्थानीय RAM में तुरंत प्रोसेस)",
        freeConvert: "धीमा क्लाउड अपलोड (इंटरनेट स्पीड पर निर्भर)",
      },
      {
        feature: "गोपनीयता और सुरक्षा",
        videoReduce: "100% निजी (फाइलें कभी आपके डिवाइस से बाहर नहीं जातीं)",
        freeConvert: "फाइलें तीसरे पक्ष के सर्वर पर स्टोर होती हैं",
      },
      {
        feature: "फाइल साइज लिमिट",
        videoReduce: "असीमित (1GB से 10GB+ तक प्रोसेस करें)",
        freeConvert: "पेड प्लान के बिना 1GB की सख्त सीमा",
      },
      {
        feature: "कतार और विज्ञापन",
        videoReduce: "तुरंत प्रोसेसिंग (कोई कतार नहीं)",
        freeConvert: "धीमी कतारें और अनचाहे विज्ञापन",
      },
    ],
    selectFile: "वीडियो फाइल चुनें",
    step1: "फाइल चुनें",
    step2: "सेटिंग्स चुनें",
    step3: "डाउनलोड और सेव करें",
    targetLimit: "टारगेट लिमिट:",
    recommendedPreset: "अनुशंसित प्रीसेट:",
    loadingEngine: "कन्वर्टर इंजन लोड हो रहा है...",
  },
};
