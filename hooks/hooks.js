import { getEnglishName } from "all-iso-language-codes";

export function codeToLangTransformer(languagesArray) {
  let languageNames = new Intl.DisplayNames(["en"], { type: "language" });

  let duplicateLanguages = [
    "Akan",
    "Amharic",
    "Arabic",
    "Aymara",
    "Bhojpuri",
    "Bambara",
    "Tibetan",
    "Buriat",
    "Catalan",
    "Chuvash",
    "Dinka",
    "Fula",
    "Hausa",
    "Haida",
    "Armenian",
    "Igbo",
    "Inuktitut",
    "Kikuyu",
    "Kanuri",
    "Kongo",
    "Kanuri",
    "Kurdish",
    "Komi",
    "Central Dusun",
    "Lingala",
    "Malagasy",
    "Nepali",
    "Nyanja",
    "Oromo",
    "Punjabi",
    "Persian",
    "Malagasy",
    "Dari",
    "Quechua",
    "Romanian",
    "Romany",
    "Rundi",
    "Kinyarwanda",
    "Croatian",
    "Shona",
    "Somali",
    "Serbian",
    "Southern Sotho",
    "Swahili",
    "Tigrinya",
    "Filipino",
    "Akan",
    "Wolof",
    "Xhosa",
    "Yoruba",
    "Chinese",
    "Chinese (China)",
    "Malay",
    "Zulu",
    "Zaza",
  ];

  let codeToLang = languagesArray.map((lang, idx) => {
    let correctCode = lang.replace("_", "-");
    try {
      return {
        value: correctCode,
        label:
          getEnglishName(correctCode) === null &&
            duplicateLanguages.includes(languageNames.of(correctCode))
            ? `${languageNames.of(correctCode)} (${correctCode})`
            : getEnglishName(correctCode) !== null &&
              duplicateLanguages.includes(getEnglishName(correctCode))
              ? `${getEnglishName(correctCode)} (${correctCode})`
              : getEnglishName(correctCode) === null &&
                !duplicateLanguages.includes(languageNames.of(correctCode))
                ? `${languageNames.of(correctCode)}`
                : `${getEnglishName(correctCode)}`,
        id: idx,
      };
    } catch (error) {
      return { value: correctCode, label: correctCode, id: idx };
    }
  });
  return codeToLang;
}

export function languagePairName(languagesArray) {
  let languageNames = new Intl.DisplayNames(["en"], { type: "language" });

  let codeToLang = languagesArray.map((lang, idx) => {
    let correctCode = lang.replace("_", "-");
    try {
      return {
        value: correctCode,
        label:
          getEnglishName(correctCode) === null
            ? `${languageNames.of(correctCode)} (${correctCode})`
            : `${getEnglishName(correctCode)} (${correctCode})`,
        id: idx,
      };
    } catch (error) {
      return { value: correctCode, label: correctCode, id: idx };
    }
  });
  return codeToLang;
}

////// Dark Color Generator function

export function randDarkColor() {
  var lum = -0.25;
  var hex = String(
    "#" + Math.random().toString(16).slice(2, 8).toUpperCase()
  ).replace(/[^0-9a-f]/gi, "");
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  var rgb = "#",
    c,
    i;
  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
    rgb += ("00" + c).substr(c.length);
  }
  return rgb;
}
export function unEscape(htmlStr) {
  htmlStr = htmlStr.replace(/&lt;/g, "<");
  htmlStr = htmlStr.replace(/&gt;/g, ">");
  htmlStr = htmlStr.replace(/&quot;/g, '"');
  htmlStr = htmlStr.replace(/&#39;/g, "'");
  htmlStr = htmlStr.replace(/&amp;/g, "&");
  htmlStr = htmlStr.replace(/&nbsp;/g, " ");
  htmlStr = htmlStr.replace(/&cent;/g, "¢");
  htmlStr = htmlStr.replace(/&pound;/g, "£");
  htmlStr = htmlStr.replace(/&yen;/g, "¥");
  htmlStr = htmlStr.replace(/&euro;/g, "€");
  htmlStr = htmlStr.replace(/&copy;/g, "©");
  htmlStr = htmlStr.replace(/&reg;/g, "®");
  htmlStr = htmlStr.replace(/&apos;/g, "'");
  return htmlStr;
}

export function doubleFilter(person, value) {
  const valueino = person.value.toLowerCase();
  let lastname = person.label.toLowerCase();
  let search = value.toLowerCase();

  return lastname.indexOf(search) === 0 || valueino.indexOf(search) === 0;
}

export const removeLanguage = [
  "zh_tw",
  "zh_hk",
  "zh_cn",
  "pt_br",
  "nn_no",
  "nb_no",
  "hi_in",
  "fr_ca",
  "es_mx",
  "es_cl",
  "es_ar",
  "en_za",
  "en_gb",
  "en_ca",
  "bn_in",
];
export const DataFormatter = (number) => {
  if (typeof number !== "number") {
    return number;
  }
  if (number > 1000000000) {
    return (number / 1000000000).toString() + "B";
  } else if (number > 1000000) {
    return (number / 1000000).toString() + "M";
  } else if (number > 1000) {
    return (number / 1000).toString() + "K";
  } else {
    return number.toString();
  }
};

export const numberFormatter = (num) => {
  const formatted = num
    ? Intl.NumberFormat("en", {
      notation: "compact",
    }).format(num)
    : "";

  return formatted;
};

export const avgCalculator = (catalog) => {
  const avgScore =
    avgValues
      .filter((el) => el.catalog === catalog)
      .reduce((a, b) => {
        return a + +b.score;
      }, 0) / avgValues.filter((el) => el.catalog === catalog).length;

  return parseFloat(avgScore.toFixed(2));
};

export function langName(languagesArray) {
  let languageNames = new Intl.DisplayNames(["en"], { type: "language" });

  let codeToLang = languagesArray.map((lang, idx) => {
    let correctCode = lang.replace("_", "-");
    try {
      return {
        value: correctCode,
        label:
          getEnglishName(correctCode) === null
            ? `${languageNames.of(correctCode)}`
            : getEnglishName(correctCode) !== null
              ? `${getEnglishName(correctCode)}`
              : getEnglishName(correctCode) === null
                ? `${languageNames.of(correctCode)}`
                : `${getEnglishName(correctCode)}`,
        id: idx,
      };
    } catch (error) {
      return { value: correctCode, label: correctCode, id: idx };
    }
  });
  return codeToLang;
}

export const percFormatter = (number) => {
  return number.toString() + "%";
};

export function sampleSentenceCleaner(sentence) {
  return unEscape(sentence.replaceAll(/\(.*\)=".*">/g, ""));
}

export const rtlLanguages = [
  "ar",
  "ar-AE",
  "ar-BH",
  "ar-DJ",
  "ar-DZ",
  "ar-EG",
  "ar-IQ",
  "ar-JO",
  "ar-KW",
  "ar-LB",
  "ar-LY",
  "ar-MA",
  "ar-OM",
  "ar-QA",
  "ar-SA",
  "ar-SD",
  "ar-SY",
  "ar-TN",
  "ar-YE",
  "fa-AF",
  "fa-IR",
  "fa",
  "he",
  "he-IL",
  "iw",
  "kd",
  "pk-PK",
  "ps",
  "ug",
  "ur",
  "ur-IN",
  "ur-PK",
  "yi",
  "yi-US",
];



export function downloadSentencesAsTSV(sentences, filename = 'sentences.tsv', secondModality) {
  // Input validation
  if (!sentences || !Array.isArray(sentences)) {
    console.error('Invalid sentences parameter');
    return;
  }

  // Constants for column separators
  const COLUMN_SEPARATOR = secondModality ? "<br>" : /\(trg\)=".*">/;

  // Process sentences
  const tsvContent = sentences.map(sentence => {
    // Split sentence and escape content
    const [columnA, columnB] = sentence.split(COLUMN_SEPARATOR);
    const escapedA = columnA.replace(/\t/g, '\\t');
    const escapedB = columnB?.replace(/\t/g, '\\t') ?? '';

    const cleanA = sampleSentenceCleaner(escapedA);
    const cleanB = sampleSentenceCleaner(escapedB);

    return `${cleanA.replaceAll("\n", "").replaceAll("<br>", "")}\t${cleanB.replaceAll("\n", "").replaceAll("<br>", "")}`;
  }).join('\n');

  // Create and trigger download
  const blob = new Blob([tsvContent], { type: 'text/tab-separated-values' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  Object.assign(link, {
    href: url,
    download: filename
  });

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}