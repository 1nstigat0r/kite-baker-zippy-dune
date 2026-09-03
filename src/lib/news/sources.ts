/** Desk source pool — scan these first, then go to the original speaker. */

export const SOURCE_POOL = {
  lebanon: [
    "al-akhbar.com",
    "aljadeed.tv",
    "mtv.com.lb",
    "lbci.com.lb",
    "alahednews.com.lb",
    "almanar.com.lb",
    "nna-leb.gov.lb",
  ],
  panArab: [
    "aawsat.com",
    "english.aawsat.com",
    "asharq.com",
    "alarabiya.net",
    "alaraby.co.uk",
    "alhurra.com",
    "eremnews.com",
    "skynewsarabia.com",
  ],
  gulf: ["arabnews.com", "thenationalnews.com", "gulfnews.com", "spa.gov.sa"],
  iraq: ["shafaq.com", "ina.iq", "alsumaria.tv"],
  yemen: ["almasirah.net", "sabanew.net", "aden-alhadath.net"],
  iran: ["farsnews.ir", "tasnimnews.com", "irna.ir", "isna.ir", "presstv.ir", "defapress.ir", "mehrnews.com", "snn.ir", "nournews.ir", "iribnews.ir", "jamaran.news", "ilna.ir"],
  intl: ["reuters.com", "axios.com", "ft.com", "wsj.com", "apnews.com"],
} as const;

export { RSS_SOURCES, TELEGRAM_SOURCES, X_HANDLES } from "./rss-sources";
export type { RssSource, TelegramSource } from "./rss-sources";
