import { SUPPORTED_LOCALES, SupportedLocale, LOCALES, isValidLocale } from "./locales";
import { UI_TRANSLATIONS, UiTranslations } from "./translations";
import { FORMAT_PAIRS, FormatPairData, getFormatPairBySlug } from "../formats";
import { USE_CASES, UseCaseData, getUseCaseBySlug } from "../use-cases";

export * from "./locales";
export * from "./translations";

export function getTranslations(lang: string): UiTranslations {
  if (isValidLocale(lang)) {
    return UI_TRANSLATIONS[lang];
  }
  return UI_TRANSLATIONS.en;
}

export interface LocalizedFormatPair extends FormatPairData {
  lang: SupportedLocale;
  localeH1: string;
  localeTagline: string;
  localeWhyConvert: string;
  localeSeoTitle: string;
  localeSeoDescription: string;
  localeKeywords: string[];
  localeTechnicalSpecs: { label: string; value: string }[];
  localeSteps: { step: number; title: string; desc: string }[];
  localeFaqs: { q: string; a: string }[];
}

// Localized FAQ and Steps generators
function getFormatFaqsByLang(from: string, to: string, lang: SupportedLocale, baseFaqs: { q: string; a: string }[]): { q: string; a: string }[] {
  if (lang === "es") {
    return [
      {
        q: `¿La conversión de ${from} a ${to} reduce la calidad del video?`,
        a: `No. VideoReduce utiliza transcodificación de alta fidelidad con escalado bicúbico, manteniendo una claridad visual nítida en 1080p y 4K sin artefactos de compresión.`,
      },
      {
        q: `¿Por qué convertir archivos ${from} a ${to}?`,
        a: `El formato ${from} suele tener problemas de reproducción en ciertos dispositivos y navegadores. Convertir a ${to} garantiza una compatibilidad del 100% en todas las pantallas.`,
      },
      {
        q: `¿Existe algún límite de tamaño para convertir archivos ${from}?`,
        a: `A diferencia de los convertidores en la nube con límites de 100MB o 1GB, VideoReduce opera en la memoria de tu navegador con WebAssembly, permitiendo procesar archivos de varios gigabytes sin límites.`,
      },
      {
        q: `¿Mis videos personales se suben a servidores externos?`,
        a: `Cero bytes salen de tu computadora. Todos los fotogramas se procesan localmente en la memoria de tu navegador, garantizando total privacidad.`,
      },
    ];
  } else if (lang === "pt") {
    return [
      {
        q: `A conversão de ${from} para ${to} reduz a qualidade do vídeo?`,
        a: `Não. O VideoReduce utiliza transcodificação de alta fidelidade com renderização bicúbica, mantendo detalhes visuais nítidos em 1080p e 4K.`,
      },
      {
        q: `Por que converter arquivos ${from} em ${to}?`,
        a: `O formato ${from} frequentemente apresenta incompatibilidades em reprodutores de mídia e celulares. O formato ${to} oferece compatibilidade universal em qualquer tela.`,
      },
      {
        q: `Existe algum limite de tamanho de arquivo para converter ${from}?`,
        a: `Não há limites de upload porque o processamento ocorre na memória RAM local do seu navegador através de WebAssembly.`,
      },
      {
        q: `Meus vídeos pessoais são enviados para algum servidor?`,
        a: `Nenhum dado sai do seu dispositivo. Toda a conversão ocorre 100% localmente no navegador com total segurança e privacidade.`,
      },
    ];
  } else if (lang === "fr") {
    return [
      {
        q: `La conversion de ${from} en ${to} réduit-elle la qualité vidéo ?`,
        a: `Non. VideoReduce utilise un transcodage haute fidélité avec mise à l'échelle bicubique, préservant tous les détails en 1080p et 4K sans artefacts de compression.`,
      },
      {
        q: `Pourquoi convertir les fichiers ${from} au format ${to} ?`,
        a: `Le format ${from} est souvent incompatible avec certains lecteurs multimédias ou appareils mobiles. La conversion en ${to} assure une lecture universelle sur tous les écrans.`,
      },
      {
        q: `Y a-t-il une limite de taille de fichier pour convertir ${from} ?`,
        a: `Contrairement aux convertisseurs cloud limités à 1 Go, VideoReduce fonctionne dans la mémoire de votre navigateur avec WebAssembly, permettant de traiter des fichiers de plusieurs gigaoctets.`,
      },
      {
        q: `Mes vidéos personnelles sont-elles envoyées sur des serveurs externes ?`,
        a: `Zéro octet ne quitte votre ordinateur. Tout le traitement s'effectue localement dans la mémoire de votre navigateur pour une confidentialité absolue.`,
      },
    ];
  } else if (lang === "de") {
    return [
      {
        q: `Verringert die Konvertierung von ${from} in ${to} die Videoqualität?`,
        a: `Nein. VideoReduce nutzt High-Fidelity-Transcodierung mit bikubischer Skalierung, sodass gestochen scharfe 1080p- und 4K-Details erhalten bleiben.`,
      },
      {
        q: `Warum sollte man ${from}-Dateien in ${to} konvertieren?`,
        a: `Das ${from}-Format wird auf vielen modernen Smartphones und Media-Playern nicht nativ unterstützt. ${to} garantiert 100% universelle Wiedergabe.`,
      },
      {
        q: `Gibt es ein Dateigrößenlimit für die Konvertierung von ${from}?`,
        a: `Nein. Da die Konvertierung über WebAssembly direkt im lokalen Arbeitsspeicher Ihres Browsers erfolgt, gibt es keine Cloud-Dateilimits.`,
      },
      {
        q: `Werden meine Videos auf fremde Server hochgeladen?`,
        a: `Es werden keine Daten übertragen. Alle Videoframes werden lokal in Ihrem Browser verarbeitet – für maximale Privatsphäre.`,
      },
    ];
  } else if (lang === "it") {
    return [
      {
        q: `La conversione da ${from} a ${to} riduce la qualità del video?`,
        a: `No. VideoReduce utilizza una transcodifica ad alta fedeltà con ridimensionamento bicubico, preservando la massima nitidezza in 1080p e 4K.`,
      },
      {
        q: `Perché convertire file ${from} in ${to}?`,
        a: `I file ${from} causano spesso errori di riproduzione su smartphone e smart TV. Il formato ${to} garantisce compatibilità immediata ovunque.`,
      },
      {
        q: `C'è un limite di dimensione per i file ${from}?`,
        a: `Nessun limite cloud restrittivo. L'elaborazione avviene nella memoria RAM locale del browser tramite WebAssembly.`,
      },
      {
        q: `I miei video personali vengono caricati su server online?`,
        a: `Zero byte lasciano il tuo dispositivo. La conversione viene eseguita interamente all'interno del browser con privacy al 100%.`,
      },
    ];
  } else if (lang === "hi") {
    return [
      {
        q: `क्या ${from} को ${to} में बदलने से वीडियो की क्वालिटी कम होती है?`,
        a: `नहीं। VideoReduce उच्च-गुणवत्ता वाले H.264 ट्रांसकोडिंग का उपयोग करता है, जिससे 1080p और 4K वीडियो की स्पष्टता पूरी तरह सुरक्षित रहती है।`,
      },
      {
        q: `${from} वीडियो को ${to} में कन्वर्ट क्यों करना चाहिए?`,
        a: `${from} फॉर्मेट कई मोबाइल फोन और टीवी पर सही से नहीं चलता। ${to} फॉर्मेट दुनिया के हर डिवाइस पर आसानी से चलता है।`,
      },
      {
        q: `क्या ${from} फाइल कन्वर्ट करने की कोई साइज लिमिट है?`,
        a: `नहीं। यह टूल आपके ब्राउज़र की RAM में WebAssembly द्वारा चलता है, इसलिए आप बिना किसी फाइल लिमिट के बड़े वीडियो भी कन्वर्ट कर सकते हैं।`,
      },
      {
        q: `क्या मेरी प्राइवेट वीडियो किसी सर्वर पर अपलोड होती है?`,
        a: `बिल्कुल नहीं। 0 बाइट्स इंटरनेट पर जाते हैं। पूरा प्रोसेस 100% आपके अपने कंप्यूटर/फोन में ऑफलाइन जैसा होता है।`,
      },
    ];
  }
  return baseFaqs;
}

function getFormatStepsByLang(from: string, to: string, lang: SupportedLocale): { step: number; title: string; desc: string }[] {
  if (lang === "es") {
    return [
      { step: 1, title: `Seleccionar Archivo ${from}`, desc: `Elige tu video ${from} desde tu dispositivo.` },
      { step: 2, title: `Ajustar Salida ${to}`, desc: `El formato ${to} se configura automáticamente con perfil de alta calidad.` },
      { step: 3, title: `Convertir y Descargar`, desc: `Transcodifica al instante en memoria local y descarga tu video ${to}.` },
    ];
  } else if (lang === "pt") {
    return [
      { step: 1, title: `Selecionar Vídeo ${from}`, desc: `Escolha seu arquivo ${from} salvo no computador ou celular.` },
      { step: 2, title: `Definir Perfil ${to}`, desc: `O formato ${to} é configurado com alta fidelidade visual.` },
      { step: 3, title: `Baixar Vídeo ${to}`, desc: `Baixe seu novo arquivo ${to} pronto para reprodução imediata.` },
    ];
  } else if (lang === "fr") {
    return [
      { step: 1, title: `Sélectionner le Fichier ${from}`, desc: `Choisissez votre enregistrement ${from} depuis votre appareil.` },
      { step: 2, title: `Configurer le Format ${to}`, desc: `Le format ${to} est configuré avec un profil de haute qualité.` },
      { step: 3, title: `Convertir & Télécharger`, desc: `Transcodez instantanément dans la RAM locale et enregistrez votre ${to}.` },
    ];
  } else if (lang === "de") {
    return [
      { step: 1, title: `${from}-Datei Auswählen`, desc: `Wählen Sie Ihr ${from}-Video von Ihrem Gerät aus.` },
      { step: 2, title: `${to}-Profil Einstellen`, desc: `Das ${to}-Format wird automatisch mit bester Qualität konfiguriert.` },
      { step: 3, title: `Konvertieren & Herunterladen`, desc: `Laden Sie Ihre fertige ${to}-Videodatei sofort herunter.` },
    ];
  } else if (lang === "it") {
    return [
      { step: 1, title: `Seleziona File ${from}`, desc: `Carica il tuo video in formato ${from} dal dispositivo.` },
      { step: 2, title: `Imposta Destinazione ${to}`, desc: `Il profilo ${to} è ottimizzato automaticamente per la massima qualità.` },
      { step: 3, title: `Converti e Salva`, desc: `Scarica il nuovo file ${to} pronto per qualsiasi lettore.` },
    ];
  } else if (lang === "hi") {
    return [
      { step: 1, title: `${from} फाइल चुनें`, desc: `अपने डिवाइस से ${from} वीडियो चुनें।` },
      { step: 2, title: `${to} फॉर्मेट सेट करें`, desc: `${to} फॉर्मेट उच्च क्वालिटी प्रोफाइल के साथ सेट होता है।` },
      { step: 3, title: `कन्वर्ट और डाउनलोड करें`, desc: `तुरंत अपने ब्राउज़र में प्रोसेस करके ${to} वीडियो डाउनलोड करें।` },
    ];
  }
  return [
    { step: 1, title: `Select ${from} File`, desc: `Choose your ${from} recording from your local device.` },
    { step: 2, title: `Choose ${to} Profile`, desc: `${to} format is automatically selected with high quality.` },
    { step: 3, title: `Convert & Download`, desc: `Transcode instantly in local RAM and download your ${to}.` },
  ];
}

function getFormatSpecsByLang(from: string, to: string, lang: SupportedLocale, baseSpecs: { label: string; value: string }[]): { label: string; value: string }[] {
  if (lang === "es") {
    return [
      { label: "Contenedor de Entrada", value: `${from} Video` },
      { label: "Contenedor de Salida", value: `${to} Estándar` },
      { label: "Motor de Procesamiento", value: "WebAssembly SIMD en el Navegador" },
      { label: "Privacidad de Archivos", value: "100% Local (0 Subidas al Servidor)" },
    ];
  } else if (lang === "pt") {
    return [
      { label: "Formato de Entrada", value: `${from} Vídeo` },
      { label: "Formato de Saída", value: `${to} Universal` },
      { label: "Motor de Execução", value: "WebAssembly SIMD no Navegador" },
      { label: "Privacidade", value: "100% Local (Sem uploads)" },
    ];
  } else if (lang === "fr") {
    return [
      { label: "Conteneur d'Entrée", value: `Vidéo ${from}` },
      { label: "Conteneur de Sortie", value: `${to} Universel` },
      { label: "Moteur de Traitement", value: "WebAssembly SIMD dans le Navigateur" },
      { label: "Sécurité & Confidentialité", value: "100% Local (0 Envoi Cloud)" },
    ];
  } else if (lang === "de") {
    return [
      { label: "Eingabeformat", value: `${from}-Video` },
      { label: "Ausgabeformat", value: `Universelles ${to}` },
      { label: "Verarbeitungs-Engine", value: "WebAssembly SIMD im Browser" },
      { label: "Datenschutz", value: "100% Lokal (Kein Server-Upload)" },
    ];
  } else if (lang === "it") {
    return [
      { label: "Contenitore di Origine", value: `Video ${from}` },
      { label: "Contenitore di Uscita", value: `${to} Universale` },
      { label: "Motore di Esecuzione", value: "WebAssembly SIMD nel Browser" },
      { label: "Privacy Dati", value: "100% Locale (0 Upload)" },
    ];
  } else if (lang === "hi") {
    return [
      { label: "इनपुट फॉर्मेट", value: `${from} वीडियो` },
      { label: "आउटपुट फॉर्मेट", value: `${to} यूनिवर्सल` },
      { label: "प्रोसेसिंग इंजन", value: "ब्राउज़र में WebAssembly SIMD" },
      { label: "डेटा गोपनीयता", value: "100% सुरक्षित (सर्वर पर अपलोड नहीं)" },
    ];
  }
  return baseSpecs;
}

export function getLocalizedFormat(slug: string, lang: SupportedLocale): LocalizedFormatPair | undefined {
  const base = getFormatPairBySlug(slug);
  if (!base) return undefined;

  let localizedH1 = base.h1;
  let localizedTagline = base.tagline;
  let localizedSeoTitle = base.seoTitle;
  let localizedSeoDescription = base.seoDescription;
  let localizedWhy = base.whyConvert;
  let localizedKeywords = base.keywords;

  if (lang === "es") {
    localizedH1 = `Convertir ${base.fromFormat} a ${base.toFormat} Online Gratis`;
    localizedTagline = `Transcodifica videos ${base.fromFormat} a formato ${base.toFormat} con 100% de privacidad en tu navegador.`;
    localizedSeoTitle = `Convertir ${base.fromFormat} a ${base.toFormat} Online Gratis`;
    localizedSeoDescription = `Convierte archivos ${base.fromFormat} a formato ${base.toFormat} en tu navegador con WebAssembly. Sin límites de subida, 100% privado y seguro.`;
    localizedWhy = `La conversión de ${base.fromFormat} a ${base.toFormat} resuelve problemas de compatibilidad y reproducción en teléfonos móviles, computadoras y navegadores web sin enviar tus archivos a servidores externos.`;
    localizedKeywords = [
      `convertir ${base.fromFormat.toLowerCase()} a ${base.toFormat.toLowerCase()}`,
      `convertidor ${base.fromFormat.toLowerCase()} a ${base.toFormat.toLowerCase()} gratis`,
      `pasar ${base.fromFormat.toLowerCase()} a ${base.toFormat.toLowerCase()} online`,
      `transformar video ${base.fromFormat.toLowerCase()} a ${base.toFormat.toLowerCase()}`,
      `reproducir ${base.fromFormat.toLowerCase()} en pc movil`,
    ];
  } else if (lang === "pt") {
    localizedH1 = `Converter ${base.fromFormat} para ${base.toFormat} Online Grátis`;
    localizedTagline = `Converta vídeos ${base.fromFormat} em ${base.toFormat} com 100% de privacidade no navegador.`;
    localizedSeoTitle = `Converter ${base.fromFormat} para ${base.toFormat} Online Grátis`;
    localizedSeoDescription = `Converta arquivos ${base.fromFormat} para ${base.toFormat} no navegador com WebAssembly. Sem limites de upload, 100% privado e rápido.`;
    localizedWhy = `Converter ${base.fromFormat} para ${base.toFormat} garante total compatibilidade com reprodutores de mídia, Smart TVs e redes sociais diretamente na memória RAM local.`;
    localizedKeywords = [
      `converter ${base.fromFormat.toLowerCase()} para ${base.toFormat.toLowerCase()}`,
      `conversor ${base.fromFormat.toLowerCase()} para ${base.toFormat.toLowerCase()} gratis`,
      `mudar ${base.fromFormat.toLowerCase()} para ${base.toFormat.toLowerCase()} online`,
      `como converter ${base.fromFormat.toLowerCase()} em ${base.toFormat.toLowerCase()}`,
      `reproduzir ${base.fromFormat.toLowerCase()} no celular`,
    ];
  } else if (lang === "fr") {
    localizedH1 = `Convertir ${base.fromFormat} en ${base.toFormat} Gratuitement en Ligne`;
    localizedTagline = `Transcodez les vidéos ${base.fromFormat} en ${base.toFormat} avec une confidentialité totale dans le navigateur.`;
    localizedSeoTitle = `Convertir ${base.fromFormat} en ${base.toFormat} en Ligne`;
    localizedSeoDescription = `Convertissez les fichiers ${base.fromFormat} en ${base.toFormat} dans votre navigateur avec WebAssembly. Aucun envoi sur serveur, 100% privé.`;
    localizedWhy = `La conversion de ${base.fromFormat} vers ${base.toFormat} permet de lire vos vidéos sur tous les appareils Apple, Windows et Android sans perte de qualité visuelle.`;
    localizedKeywords = [
      `convertir ${base.fromFormat.toLowerCase()} en ${base.toFormat.toLowerCase()}`,
      `convertisseur ${base.fromFormat.toLowerCase()} vers ${base.toFormat.toLowerCase()} gratuit`,
      `transformer ${base.fromFormat.toLowerCase()} en ${base.toFormat.toLowerCase()} en ligne`,
      `lire video ${base.fromFormat.toLowerCase()} sur pc mac`,
      `changer format ${base.fromFormat.toLowerCase()} en ${base.toFormat.toLowerCase()}`,
    ];
  } else if (lang === "de") {
    localizedH1 = `${base.fromFormat} in ${base.toFormat} Online Kostenlos Konvertieren`;
    localizedTagline = `Konvertieren Sie ${base.fromFormat}-Dateien in ${base.toFormat} mit 100% Privatsphäre direkt im Webbrowser.`;
    localizedSeoTitle = `${base.fromFormat} in ${base.toFormat} Konverter Online`;
    localizedSeoDescription = `${base.fromFormat} in ${base.toFormat} online konvertieren mit WebAssembly. Keine Upload-Limits, 100% privat ohne Server-Upload.`;
    localizedWhy = `Die Konvertierung von ${base.fromFormat} in ${base.toFormat} stellt eine universelle Wiedergabe auf allen PCs, Smartphones und Smart-TVs sicher.`;
    localizedKeywords = [
      `${base.fromFormat.toLowerCase()} in ${base.toFormat.toLowerCase()} umwandeln`,
      `${base.fromFormat.toLowerCase()} in ${base.toFormat.toLowerCase()} konvertieren kostenlos`,
      `${base.fromFormat.toLowerCase()} datei in ${base.toFormat.toLowerCase()}`,
      `${base.fromFormat.toLowerCase()} abspielen auf handy pc`,
      `${base.fromFormat.toLowerCase()} zu ${base.toFormat.toLowerCase()} online`,
    ];
  } else if (lang === "it") {
    localizedH1 = `Converti ${base.fromFormat} in ${base.toFormat} Online Gratis`;
    localizedTagline = `Converti i video ${base.fromFormat} in ${base.toFormat} con il 100% di privacy nel browser.`;
    localizedSeoTitle = `Converti ${base.fromFormat} in ${base.toFormat} Online Gratis`;
    localizedSeoDescription = `Converti file ${base.fromFormat} in ${base.toFormat} nel browser con WebAssembly. Nessun limite di upload, 100% privato e veloce.`;
    localizedWhy = `La conversione da ${base.fromFormat} a ${base.toFormat} garantisce la massima compatibilità su tutti i dispositivi moderni senza caricare file sul cloud.`;
    localizedKeywords = [
      `convertire ${base.fromFormat.toLowerCase()} in ${base.toFormat.toLowerCase()}`,
      `convertitore ${base.fromFormat.toLowerCase()} in ${base.toFormat.toLowerCase()} gratis`,
      `trasformare ${base.fromFormat.toLowerCase()} in ${base.toFormat.toLowerCase()} online`,
      `aprire file ${base.fromFormat.toLowerCase()} su pc`,
      `passare da ${base.fromFormat.toLowerCase()} a ${base.toFormat.toLowerCase()}`,
    ];
  } else if (lang === "hi") {
    localizedH1 = `${base.fromFormat} को ${base.toFormat} में ऑनलाइन मुफ्त कन्वर्ट करें`;
    localizedTagline = `अपने ब्राउज़र में 100% गोपनीयता के साथ ${base.fromFormat} वीडियो को ${base.toFormat} में ट्रांसकोड करें।`;
    localizedSeoTitle = `${base.fromFormat} से ${base.toFormat} वीडियो कन्वर्टर ऑनलाइन मुफ्त`;
    localizedSeoDescription = `WebAssembly द्वारा संचालित ऑनलाइन मुफ्त ${base.fromFormat} से ${base.toFormat} कन्वर्टर। बिना सर्वर अपलोड के सुरक्षित और तेज।`;
    localizedWhy = `${base.fromFormat} को ${base.toFormat} में बदलने से मोबाइल, टीवी और कंप्यूटर पर बिना किसी समस्या के वीडियो चलता है।`;
    localizedKeywords = [
      `${base.fromFormat.toLowerCase()} se ${base.toFormat.toLowerCase()} converter`,
      `${base.fromFormat.toLowerCase()} video ko ${base.toFormat.toLowerCase()} me badle`,
      `${base.fromFormat.toLowerCase()} file kaise khole`,
      `free ${base.fromFormat.toLowerCase()} to ${base.toFormat.toLowerCase()} converter online`,
      `${base.fromFormat.toLowerCase()} ko ${base.toFormat.toLowerCase()} me convert kare`,
    ];
  }

  const localeFaqs = getFormatFaqsByLang(base.fromFormat, base.toFormat, lang, base.faqs);
  const localeSteps = getFormatStepsByLang(base.fromFormat, base.toFormat, lang);
  const localeTechnicalSpecs = getFormatSpecsByLang(base.fromFormat, base.toFormat, lang, base.technicalSpecs);

  return {
    ...base,
    lang,
    localeH1: localizedH1,
    localeTagline: localizedTagline,
    localeWhyConvert: localizedWhy,
    localeSeoTitle: localizedSeoTitle,
    localeSeoDescription: localizedSeoDescription,
    localeKeywords: localizedKeywords,
    localeTechnicalSpecs,
    localeSteps,
    localeFaqs,
  };
}

export interface LocalizedUseCase extends UseCaseData {
  lang: SupportedLocale;
  localeH1: string;
  localeTagline: string;
  localeWhyItMatters: string;
  localeSeoTitle: string;
  localeSeoDescription: string;
  localeKeywords: string[];
  localeBestSettings: { label: string; value: string }[];
  localeSteps: { step: number; title: string; desc: string }[];
  localeFaqs: { q: string; a: string }[];
}

function getUseCaseFaqsByLang(title: string, lang: SupportedLocale, baseFaqs: { q: string; a: string }[]): { q: string; a: string }[] {
  if (lang === "es") {
    return [
      {
        q: `¿Por qué es importante pre-comprimir el video para ${title}?`,
        a: `Las plataformas aplican compresiones agresivas en sus servidores que degradan la calidad. Pre-comprimir con VideoReduce mantiene la máxima nitidez.`,
      },
      {
        q: `¿Se pierde calidad al comprimir el video?`,
        a: `No. VideoReduce optimiza los factores de tasa CRF y códecs H.264 para reducir el tamaño sin pérdida visible de claridad.`,
      },
      {
        q: `¿Hay límite de tamaño para subir videos?`,
        a: `No. Como el procesamiento ocurre en tu navegador local con WebAssembly, puedes comprimir archivos pesados sin límites.`,
      },
      {
        q: `¿Mis videos privados están seguros?`,
        a: `100% seguros. Tus videos nunca se envían a ningún servidor externo.`,
      },
    ];
  } else if (lang === "pt") {
    return [
      {
        q: `Por que é importante pré-comprimir o vídeo para ${title}?`,
        a: `A pré-compressão impede que a plataforma aplique compressões agressivas em seus servidores, mantendo alta nitidez.`,
      },
      {
        q: `O vídeo perde qualidade ao ser reduzido?`,
        a: `Não. O VideoReduce otimiza o bitrate de forma inteligente para manter qualidade visual nítida em qualquer resolução.`,
      },
      {
        q: `Existe limite de tamanho de vídeo?`,
        a: `Não há limites. O processamento ocorre na memória RAM local do seu dispositivo com WebAssembly.`,
      },
      {
        q: `Meus arquivos são confidenciais?`,
        a: `100% confidenciais. Nenhum byte sai do seu computador ou smartphone.`,
      },
    ];
  } else if (lang === "fr") {
    return [
      {
        q: `Pourquoi est-il important de pré-compresser la vidéo pour ${title} ?`,
        a: `La pré-compression empêche les serveurs de la plateforme de compresser violemment votre vidéo, garantissant une netteté maximale.`,
      },
      {
        q: `Y a-t-il une perte de qualité visible ?`,
        a: `Non. VideoReduce applique un contrôle intelligent du débit CRF pour réduire le poids sans dégrader la qualité visuelle.`,
      },
      {
        q: `Existe-t-il une limite de taille de fichier ?`,
        a: `Aucune limite arbitraire. Le traitement s'effectue dans la mémoire RAM locale de votre navigateur avec WebAssembly.`,
      },
      {
        q: `Mes vidéos privées sont-elles protégées ?`,
        a: `100% protégées. Vos fichiers ne sont jamais téléchargés sur des serveurs externes.`,
      },
    ];
  } else if (lang === "de") {
    return [
      {
        q: `Warum ist die gezielte Vorkomprimierung für ${title} wichtig?`,
        a: `Die Vorkomprimierung verhindert, dass Plattform-Server das Video aggressiv herunterrechnen und unscharf machen.`,
      },
      {
        q: `Geht beim Komprimieren Videoqualität verloren?`,
        a: `Nein. VideoReduce optimiert die Bitrate intelligent, sodass gestochen scharfe Details erhalten bleiben.`,
      },
      {
        q: `Gibt es Beschränkungen bei der Dateigröße?`,
        a: `Nein, da alles lokal in Ihrem Browser über WebAssembly läuft, können auch große Dateien problemlos komprimiert werden.`,
      },
      {
        q: `Sind meine persönlichen Daten sicher?`,
        a: `100% sicher. Es werden keine Daten über das Internet übertragen.`,
      },
    ];
  } else if (lang === "it") {
    return [
      {
        q: `Perché è fondamentale pre-comprimere il video per ${title}?`,
        a: `La pre-compressione evita che i server della piattaforma riducano drasticamente il bitrate rovinando la qualità visiva.`,
      },
      {
        q: `Si perde nitidezza durante la compressione?`,
        a: `No. VideoReduce calcola il bilanciamento ottimale tra bitrate e risoluzione preservando dettagli definiti.`,
      },
      {
        q: `C'è un limite di dimensione per i file?`,
        a: `Nessun limite. L'elaborazione sfrutta la RAM locale del tuo dispositivo tramite WebAssembly.`,
      },
      {
        q: `I miei file sono al sicuro?`,
        a: `Massima sicurezza al 100%. I video rimangono sempre e solo sul tuo dispositivo.`,
      },
    ];
  } else if (lang === "hi") {
    return [
      {
        q: `${title} के लिए वीडियो पहले से कंप्रेस करना क्यों जरूरी है?`,
        a: `प्लेटफॉर्म सर्वर बड़े वीडियो को खराब तरीके से कंप्रेस कर देते हैं। VideoReduce से कंप्रेस करने पर वीडियो की क्वालिटी हमेशा साफ रहती है।`,
      },
      {
        q: `क्या वीडियो कंप्रेस करने से धुंधलापन आता है?`,
        a: `नहीं। हमारा स्मार्ट इंजन वीडियो की ब्राइटनेस और शार्पनेस को सुरक्षित रखते हुए केवल फाइल साइज घटाता है।`,
      },
      {
        q: `क्या बड़े वीडियो फाइल की कोई सीमा है?`,
        a: `कोई लिमिट नहीं है। WebAssembly आपके ब्राउज़र में सीधे काम करता है जिससे आप कितनी भी बड़ी फाइल प्रोसेस कर सकते हैं।`,
      },
      {
        q: `क्या मेरा वीडियो सुरक्षित है?`,
        a: `100% प्राइवेट और सुरक्षित। आपकी कोई भी फाइल किसी ऑनलाइन सर्वर पर नहीं भेजी जाती।`,
      },
    ];
  }
  return baseFaqs;
}

function getUseCaseStepsByLang(title: string, lang: SupportedLocale): { step: number; title: string; desc: string }[] {
  if (lang === "es") {
    return [
      { step: 1, title: "Seleccionar Video", desc: "Elige tu archivo de video desde tu computadora o teléfono." },
      { step: 2, title: "Configurar Compresión", desc: "Ajusta el porcentaje deseado o tamaño objetivo en MB." },
      { step: 3, title: "Comprimir y Descargar", desc: "Guarda tu video optimizado listo para compartir sin retrasos." },
    ];
  } else if (lang === "pt") {
    return [
      { step: 1, title: "Selecionar Vídeo", desc: "Escolha seu vídeo salvo no dispositivo." },
      { step: 2, title: "Ajustar Pré-definição", desc: "Defina o tamanho alvo ou percentual de compressão." },
      { step: 3, title: "Baixar Vídeo", desc: "Salve seu arquivo reduzido com máxima qualidade visual." },
    ];
  } else if (lang === "fr") {
    return [
      { step: 1, title: "Sélectionner la Vidéo", desc: "Choisissez votre fichier vidéo depuis votre ordinateur ou mobile." },
      { step: 2, title: "Régler la Compression", desc: "Sélectionnez le pourcentage de réduction ou la taille cible en Mo." },
      { step: 3, title: "Télécharger", desc: "Enregistrez votre vidéo optimisée sans perte de netteté." },
    ];
  } else if (lang === "de") {
    return [
      { step: 1, title: "Video Auswählen", desc: "Laden Sie Ihre Videodatei von Ihrem Gerät hoch." },
      { step: 2, title: "Kompression Einstellen", desc: "Wählen Sie die gewünschte Zielgröße oder Reduktionsstufe." },
      { step: 3, title: "Herunterladen", desc: "Speichern Sie das komprimierte Video sofort ab." },
    ];
  } else if (lang === "it") {
    return [
      { step: 1, title: "Seleziona Video", desc: "Carica il file video dal tuo computer o smartphone." },
      { step: 2, title: "Configura Livello", desc: "Imposta la dimensione target in MB o la percentuale." },
      { step: 3, title: "Scarica File", desc: "Salva il video ottimizzato pronto per la condivisione immediata." },
    ];
  } else if (lang === "hi") {
    return [
      { step: 1, title: "वीडियो चुनें", desc: "अपने फोन या कंप्यूटर से वीडियो फाइल सेलेक्ट करें।" },
      { step: 2, title: "साइज सेटिंग्स चुनें", desc: "टारगेट साइज (MB) या पर्सेंटेज सेट करें।" },
      { step: 3, title: "डाउनलोड करें", desc: "कंप्रेस हुआ हल्का और साफ वीडियो तुरंत सेव करें।" },
    ];
  }
  return [
    { step: 1, title: "Select Video", desc: "Choose your video file from your computer or phone." },
    { step: 2, title: "Configure Settings", desc: "Pick your desired target size or percentage reduction." },
    { step: 3, title: "Download", desc: "Save your optimized video ready for sharing." },
  ];
}

function getUseCaseSpecsByLang(lang: SupportedLocale, targetSizeText: string, baseSettings: { label: string; value: string }[]): { label: string; value: string }[] {
  if (lang === "es") {
    return [
      { label: "Límite Objetivo", value: targetSizeText },
      { label: "Códec de Salida", value: "H.264 Universal + AAC Audio" },
      { label: "Motor de Procesamiento", value: "WebAssembly SIMD en el Navegador" },
      { label: "Seguridad de Datos", value: "100% Privado (0 Subidas a la Nube)" },
    ];
  } else if (lang === "pt") {
    return [
      { label: "Tamanho Alvo", value: targetSizeText },
      { label: "Codec de Saída", value: "H.264 Universal + AAC Áudio" },
      { label: "Motor", value: "WebAssembly SIMD no Navegador" },
      { label: "Privacidade", value: "100% Local no Navegador" },
    ];
  } else if (lang === "fr") {
    return [
      { label: "Taille Cible", value: targetSizeText },
      { label: "Codec de Sortie", value: "H.264 Universel + Audio AAC" },
      { label: "Moteur de Traitement", value: "WebAssembly SIMD dans le Navigateur" },
      { label: "Confidentialité", value: "100% Privé (Aucun envoi serveur)" },
    ];
  } else if (lang === "de") {
    return [
      { label: "Zielgröße", value: targetSizeText },
      { label: "Video-Codec", value: "Universelles H.264 + AAC Audio" },
      { label: "Verarbeitungs-Engine", value: "WebAssembly SIMD im Browser" },
      { label: "Datenschutz", value: "100% Lokal (Keine Cloud-Übertragung)" },
    ];
  } else if (lang === "it") {
    return [
      { label: "Dimensione Target", value: targetSizeText },
      { label: "Codec di Uscita", value: "H.264 Universale + Audio AAC" },
      { label: "Motore", value: "WebAssembly SIMD nel Browser" },
      { label: "Privacy", value: "100% Privato (Zero upload)" },
    ];
  } else if (lang === "hi") {
    return [
      { label: "टारगेट साइज", value: targetSizeText },
      { label: "वीडियो कोडेक", value: "यूनिवर्सल H.264 + AAC ऑडियो" },
      { label: "प्रोसेसिंग इंजन", value: "ब्राउज़र में WebAssembly SIMD" },
      { label: "गोपनीयता", value: "100% सुरक्षित (सर्वर पर अपलोड नहीं)" },
    ];
  }
  return baseSettings;
}

export function getLocalizedUseCase(slug: string, lang: SupportedLocale): LocalizedUseCase | undefined {
  const base = getUseCaseBySlug(slug);
  if (!base) return undefined;

  let localizedH1 = base.h1;
  let localizedTagline = base.tagline;
  let localizedSeoTitle = base.seoTitle;
  let localizedSeoDescription = base.seoDescription;
  let localizedWhy = base.whyItMatters;
  let localizedKeywords = base.keywords;

  if (lang === "es") {
    const esTitleMap: Record<string, string> = {
      "whatsapp-video": "Comprimir Video para WhatsApp Online Gratis",
      "discord-video": "Comprimir Video para Discord Online Gratis (Bajo 25MB)",
      "email-attachment": "Comprimir Video para Correo Electrónico (Gmail y Outlook)",
      "4k-to-1080p": "Reducir Video 4K a 1080p Full HD Online Gratis",
      "instagram-reels": "Comprimir Video para Instagram Reels (1080x1920 HD)",
      "tiktok-video": "Comprimir Video para TikTok Online Gratis (Bajo 72MB)",
      "youtube-shorts": "Comprimir Video para YouTube Shorts (1080p 60fps)",
      "slack-video": "Comprimir Video para Slack (Reproductor Integrado)",
      "twitter-x-video": "Comprimir Video para Twitter / X (Bajo 512MB)",
      "powerpoint-video": "Comprimir Video para PowerPoint (Sin Bloqueos)",
      "zoom-recording": "Comprimir Grabación de Zoom Online Gratis (Ahorro 90%)",
      "compress-video-under-10mb": "Comprimir Video a Menos de 10MB Online Gratis",
      "compress-video-under-25mb": "Comprimir Video a Menos de 25MB (Discord y Gmail)",
      "compress-video-under-50mb": "Comprimir Video a Menos de 50MB Online Gratis",
      "compress-video-under-100mb": "Comprimir Video a Menos de 100MB (Canvas y LMS)",
      "compress-iphone-video": "Comprimir Video de iPhone Online Gratis (Reducir 4K MOV)",
    };

    localizedH1 = esTitleMap[slug] || `Comprimir Video para ${base.title}`;
    localizedTagline = `Optimiza y reduce el tamaño de tus videos para ${base.title} con 100% de privacidad en el navegador.`;
    localizedSeoTitle = `${esTitleMap[slug] || `Comprimir Video para ${base.title}`}`;
    localizedSeoDescription = `Comprime y optimiza videos para ${base.title} en tu navegador con WebAssembly. Sin marcas de agua, sin subidas al servidor y sin pérdida de calidad.`;
    localizedWhy = `La compresión previa optimizada para ${base.title} evita que los algoritmos de la plataforma arruinen la calidad visual de tus videos.`;
    localizedKeywords = [
      `comprimir video para ${slug.replace(/-/g, " ")}`,
      `reducir tamano video ${slug.replace(/-/g, " ")}`,
      `compresor de video online gratis`,
      `como enviar video pesado ${slug.replace(/-/g, " ")}`,
      `bajar peso video sin perder calidad`,
    ];
  } else if (lang === "pt") {
    const ptTitleMap: Record<string, string> = {
      "whatsapp-video": "Comprimir Vídeo para WhatsApp Online Grátis",
      "discord-video": "Comprimir Vídeo para Discord Online Grátis (Menos de 25MB)",
      "email-attachment": "Comprimir Vídeo para Anexo de Email (Gmail e Outlook)",
      "4k-to-1080p": "Converter Vídeo 4K para 1080p Full HD Online Grátis",
      "instagram-reels": "Comprimir Vídeo para Instagram Reels (1080x1920 HD)",
      "tiktok-video": "Comprimir Vídeo para TikTok Online Grátis (Menos de 72MB)",
      "youtube-shorts": "Comprimir Vídeo para YouTube Shorts (1080p 60fps)",
      "slack-video": "Comprimir Vídeo para Slack (Player Direto no Chat)",
      "twitter-x-video": "Comprimir Vídeo para Twitter / X (Menos de 512MB)",
      "powerpoint-video": "Comprimir Vídeo para PowerPoint (Sem Travamentos)",
      "zoom-recording": "Comprimir Gravação do Zoom Online Grátis (Até 90% Menor)",
      "compress-video-under-10mb": "Comprimir Vídeo para Menos de 10MB Online Grátis",
      "compress-video-under-25mb": "Comprimir Vídeo para Menos de 25MB (Discord e Gmail)",
      "compress-video-under-50mb": "Comprimir Vídeo para Menos de 50MB Online Grátis",
      "compress-video-under-100mb": "Comprimir Vídeo para Menos de 100MB (Faculdade e LMS)",
      "compress-iphone-video": "Comprimir Vídeo do iPhone Online Grátis (Reduzir 4K MOV)",
    };

    localizedH1 = ptTitleMap[slug] || `Comprimir Vídeo para ${base.title}`;
    localizedTagline = `Otimize e reduza o tamanho de vídeos para ${base.title} com privacidade total no navegador.`;
    localizedSeoTitle = `${ptTitleMap[slug] || `Comprimir Vídeo para ${base.title}`}`;
    localizedSeoDescription = `Comprima vídeos para ${base.title} diretamente no seu navegador. 100% privado com WebAssembly e sem perda de qualidade visual.`;
    localizedWhy = `A pré-compressão adequada para ${base.title} garante carregamento rápido e evita cortes bruscos de qualidade.`;
    localizedKeywords = [
      `comprimir video para ${slug.replace(/-/g, " ")}`,
      `diminuir tamanho de video ${slug.replace(/-/g, " ")}`,
      `compressor de video gratis online`,
      `como enviar video grande ${slug.replace(/-/g, " ")}`,
      `reduzir tamanho video sem perder qualidade`,
    ];
  } else if (lang === "fr") {
    const frTitleMap: Record<string, string> = {
      "whatsapp-video": "Compresser une Vidéo pour WhatsApp en Ligne Gratuit",
      "discord-video": "Compresser une Vidéo pour Discord (Moins de 25 Mo)",
      "email-attachment": "Compresser une Vidéo pour Email (Gmail et Outlook)",
      "4k-to-1080p": "Convertir Vidéo 4K en 1080p Full HD en Ligne Gratuit",
      "instagram-reels": "Compresser Vidéo pour Instagram Reels (1080x1920 HD)",
      "tiktok-video": "Compresser Vidéo pour TikTok en Ligne (Moins de 72 Mo)",
      "youtube-shorts": "Compresser Vidéo pour YouTube Shorts (1080p 60fps)",
      "slack-video": "Compresser Vidéo pour Slack (Lecture Intégrée)",
      "twitter-x-video": "Compresser Vidéo pour Twitter / X (Moins de 512 Mo)",
      "powerpoint-video": "Compresser Vidéo pour PowerPoint (Sans Ralentissement)",
      "zoom-recording": "Compresser Enregistrement Zoom en Ligne (Réduction 90%)",
      "compress-video-under-10mb": "Compresser Vidéo à Moins de 10 Mo en Ligne Gratuit",
      "compress-video-under-25mb": "Compresser Vidéo à Moins de 25 Mo (Discord et Gmail)",
      "compress-video-under-50mb": "Compresser Vidéo à Moins de 50 Mo en Ligne Gratuit",
      "compress-video-under-100mb": "Compresser Vidéo à Moins de 100 Mo (Canvas et LMS)",
      "compress-iphone-video": "Compresser Vidéo iPhone en Ligne (Réduire 4K MOV)",
    };

    localizedH1 = frTitleMap[slug] || `Compresser Vidéo pour ${base.title}`;
    localizedTagline = `Réduisez la taille de vos vidéos pour ${base.title} sans perte de qualité et en toute confidentialité.`;
    localizedSeoTitle = `${frTitleMap[slug] || `Compresser Vidéo pour ${base.title}`}`;
    localizedSeoDescription = `Compressez vos vidéos pour ${base.title} directement dans votre navigateur. 100% privé, sans filigrane et sans limite de taille.`;
    localizedWhy = `Une compression adaptée pour ${base.title} empêche la dégradation de la vidéo lors de la publication.`;
    localizedKeywords = [
      `compresser video pour ${slug.replace(/-/g, " ")}`,
      `reduire taille video ${slug.replace(/-/g, " ")}`,
      `compresseur video en ligne gratuit`,
      `envoyer grosse video ${slug.replace(/-/g, " ")}`,
      `diminuer poids video sans perte qualite`,
    ];
  } else if (lang === "de") {
    const deTitleMap: Record<string, string> = {
      "whatsapp-video": "Video für WhatsApp Komprimieren Online Kostenlos",
      "discord-video": "Video für Discord Komprimieren (Unter 25MB Limit)",
      "email-attachment": "Video für E-Mail Anhang Verkleinern (Gmail, Outlook)",
      "4k-to-1080p": "4K Video auf 1080p Full HD Herunterskalieren Online",
      "instagram-reels": "Video für Instagram Reels Komprimieren (1080x1920 HD)",
      "tiktok-video": "Video für TikTok Komprimieren Online (Unter 72MB)",
      "youtube-shorts": "Video für YouTube Shorts Optimieren (1080p 60fps)",
      "slack-video": "Video für Slack Komprimieren (Direkte Vorschau)",
      "twitter-x-video": "Video für Twitter / X Komprimieren (Unter 512MB)",
      "powerpoint-video": "Video für PowerPoint Verkleinern (Ruckelfrei)",
      "zoom-recording": "Zoom Meeting Aufnahme Komprimieren (Bis zu 90% Kleiner)",
      "compress-video-under-10mb": "Video auf Unter 10MB Komprimieren Online Kostenlos",
      "compress-video-under-25mb": "Video auf Unter 25MB Komprimieren (Discord & Gmail)",
      "compress-video-under-50mb": "Video auf Unter 50MB Komprimieren Online Kostenlos",
      "compress-video-under-100mb": "Video auf Unter 100MB Komprimieren (Uni & LMS)",
      "compress-iphone-video": "iPhone Video Komprimieren Online (4K MOV Verkleinern)",
    };

    localizedH1 = deTitleMap[slug] || `Video für ${base.title} Komprimieren`;
    localizedTagline = `Reduzieren Sie die Videogröße für ${base.title} mit maximaler Privatsphäre direkt im Browser.`;
    localizedSeoTitle = `${deTitleMap[slug] || `Video für ${base.title} Komprimieren`}`;
    localizedSeoDescription = `Videos für ${base.title} online komprimieren ohne Qualitätsverlust. 100% privat mit lokaler WebAssembly-Technologie.`;
    localizedWhy = `Die gezielte Vorkomprimierung für ${base.title} verhindert störende Qualitätsverluste beim Hochladen.`;
    localizedKeywords = [
      `video komprimieren fur ${slug.replace(/-/g, " ")}`,
      `videogrosse verkleinern ${slug.replace(/-/g, " ")}`,
      `video kompressor online kostenlos`,
      `grosse videos versenden ${slug.replace(/-/g, " ")}`,
      `mp4 verkleinern ohne qualitatsverlust`,
    ];
  } else if (lang === "it") {
    const itTitleMap: Record<string, string> = {
      "whatsapp-video": "Comprimi Video per WhatsApp Online Gratis",
      "discord-video": "Comprimi Video per Discord Online Gratis (Sotto 25MB)",
      "email-attachment": "Comprimi Video per Allegato Email (Gmail e Outlook)",
      "4k-to-1080p": "Converti Video 4K in 1080p Full HD Online Gratis",
      "instagram-reels": "Comprimi Video per Instagram Reels (1080x1920 HD)",
      "tiktok-video": "Comprimi Video per TikTok Online Gratis (Sotto 72MB)",
      "youtube-shorts": "Comprimi Video per YouTube Shorts (1080p 60fps)",
      "slack-video": "Comprimi Video per Slack (Riproduzione Immediata)",
      "twitter-x-video": "Comprimi Video per Twitter / X (Sotto 512MB)",
      "powerpoint-video": "Comprimi Video per PowerPoint (Senza Blocchi)",
      "zoom-recording": "Comprimi Registrazione Zoom Online Gratis (Meno 90%)",
      "compress-video-under-10mb": "Comprimi Video Sotto 10MB Online Gratis",
      "compress-video-under-25mb": "Comprimi Video Sotto 25MB (Discord e Gmail)",
      "compress-video-under-50mb": "Comprimi Video Sotto 50MB Online Gratis",
      "compress-video-under-100mb": "Comprimi Video Sotto 100MB (Università e LMS)",
      "compress-iphone-video": "Comprimi Video iPhone Online Gratis (Riduci 4K MOV)",
    };

    localizedH1 = itTitleMap[slug] || `Comprimi Video per ${base.title}`;
    localizedTagline = `Riduci le dimensioni dei video per ${base.title} con privacy totale nel browser.`;
    localizedSeoTitle = `${itTitleMap[slug] || `Comprimi Video per ${base.title}`}`;
    localizedSeoDescription = `Comprimi video per ${base.title} direttamente nel browser. Nessun caricamento su server, 100% gratuito e privato.`;
    localizedWhy = `Pre-comprimere il video per ${base.title} assicura la massima nitidezza visiva e tempi di caricamento istantanei.`;
    localizedKeywords = [
      `comprimere video per ${slug.replace(/-/g, " ")}`,
      `ridurre dimensione video ${slug.replace(/-/g, " ")}`,
      `compressore video online gratis`,
      `inviare video pesante ${slug.replace(/-/g, " ")}`,
      `rimpicciolire video senza perdere qualita`,
    ];
  } else if (lang === "hi") {
    const hiTitleMap: Record<string, string> = {
      "whatsapp-video": "WhatsApp के लिए वीडियो कंप्रेस करें ऑनलाइन मुफ्त",
      "discord-video": "Discord के लिए वीडियो साइज कम करें (25MB से कम)",
      "email-attachment": "ईमेल अटैचमेंट के लिए वीडियो कंप्रेस करें (Gmail, Outlook)",
      "4k-to-1080p": "4K वीडियो को 1080p Full HD में बदलें ऑनलाइन मुफ्त",
      "instagram-reels": "Instagram Reels के लिए वीडियो कंप्रेस करें (1080x1920)",
      "tiktok-video": "TikTok के लिए वीडियो कंप्रेस करें ऑनलाइन (72MB से कम)",
      "youtube-shorts": "YouTube Shorts के लिए वीडियो साइज कम करें (1080p 60fps)",
      "slack-video": "Slack के लिए वीडियो कंप्रेस करें ऑनलाइन",
      "twitter-x-video": "Twitter / X के लिए वीडियो कंप्रेस करें (512MB से कम)",
      "powerpoint-video": "PowerPoint प्रेजेंटेशन के लिए वीडियो कंप्रेस करें",
      "zoom-recording": "Zoom मीटिंग रिकॉर्डिंग कंप्रेस करें (90% तक छोटा)",
      "compress-video-under-10mb": "10MB से कम में वीडियो कंप्रेस करें ऑनलाइन",
      "compress-video-under-25mb": "25MB से कम में वीडियो कंप्रेस करें (Discord, Gmail)",
      "compress-video-under-50mb": "50MB से कम में वीडियो कंप्रेस करें ऑनलाइन",
      "compress-video-under-100mb": "100MB से कम में वीडियो कंप्रेस करें (कॉलेज और LMS)",
      "compress-iphone-video": "iPhone वीडियो कंप्रेस करें ऑनलाइन (4K MOV साइज कम करें)",
    };

    localizedH1 = hiTitleMap[slug] || `${base.title} ऑनलाइन मुफ्त`;
    localizedTagline = `अपने ब्राउज़र में ${base.title} के लिए वीडियो साइज कम करें, 100% प्राइवेट और तेज।`;
    localizedSeoTitle = `${hiTitleMap[slug] || `${base.title} ऑनलाइन मुफ्त`}`;
    localizedSeoDescription = `${base.title} के लिए वीडियो कंप्रेस करें। ब्राउज़र में 100% सुरक्षित और बिना क्वालिटी खोए।`;
    localizedWhy = `${base.title} के लिए सही फॉर्मेट और बिटरेट में वीडियो कंप्रेस करने से वीडियो तुरंत अपलोड होता है।`;
    localizedKeywords = [
      `${slug.replace(/-/g, " ")} ke liye video compress kare`,
      `video size kam karne wala app online`,
      `badi video ko chota kaise kare`,
      `video compressor online free hindi`,
      `bina quality khoye video compress kare`,
    ];
  }

  const localeFaqs = getUseCaseFaqsByLang(base.title, lang, base.faqs);
  const localeSteps = getUseCaseStepsByLang(base.title, lang);
  const localeBestSettings = getUseCaseSpecsByLang(lang, base.targetSizeText, base.bestSettings);

  return {
    ...base,
    lang,
    localeH1: localizedH1,
    localeTagline: localizedTagline,
    localeWhyItMatters: localizedWhy,
    localeSeoTitle: localizedSeoTitle,
    localeSeoDescription: localizedSeoDescription,
    localeKeywords: localizedKeywords,
    localeBestSettings,
    localeSteps,
    localeFaqs,
  };
}
