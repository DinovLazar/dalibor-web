// Generates the Phase 1.05 seed: a clearly-marked placeholder cover image
// (placeholder-cover.png) and the importable seed.ndjson. All visible text is
// prefixed "[PLACEHOLDER]" so nothing fake can be mistaken for real content.
//
//   node sanity/seed/build-seed.mjs
//   npx sanity dataset import sanity/seed/seed.ndjson production
//
// Localized fields use the plain { mk, en, sr } object shape (see
// src/sanity/schemaTypes/localized.ts). One review (review-1) carries the cover
// via the `_sanityAsset` import directive; every other cover is left empty to
// exercise the graceful no-image state. review-mk-only is Macedonian-only, to
// prove the fallback + "available in: MK" indicator.

import {writeFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import zlib from "node:zlib";

const here = dirname(fileURLToPath(import.meta.url));

// --- 1. Placeholder cover: a flat caramel 2:3 PNG (clearly not a real cover) ---
function writePlaceholderCover() {
  const W = 600;
  const H = 900;
  const rgb = [0xa8, 0x74, 0x37]; // caramel #A87437
  const rowLen = 1 + W * 3;
  const raw = Buffer.alloc(rowLen * H);
  for (let y = 0; y < H; y++) {
    const off = y * rowLen;
    raw[off] = 0; // filter type: none
    for (let x = 0; x < W; x++) {
      const p = off + 1 + x * 3;
      raw[p] = rgb[0];
      raw[p + 1] = rgb[1];
      raw[p + 2] = rgb[2];
    }
  }
  const idat = zlib.deflateSync(raw);

  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(Buffer.concat([typeBuf, data])) >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  };

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour (RGB)
  const png = Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  writeFileSync(join(here, "placeholder-cover.png"), png);
  return png.length;
}

// --- 2. Document helpers ---
let counter = 0;
const key = () => `k${(counter++).toString(36)}`;

const loc = (mk, en, sr) => {
  const o = {};
  if (mk !== undefined) o.mk = mk;
  if (en !== undefined) o.en = en;
  if (sr !== undefined) o.sr = sr;
  return o;
};

const para = (text) => ({
  _type: "block",
  _key: key(),
  style: "normal",
  markDefs: [],
  children: [{_type: "span", _key: key(), text, marks: []}],
});

// localized block content from arrays of paragraph strings per language
const locBlocks = (mk, en, sr) => {
  const o = {};
  if (mk) o.mk = mk.map(para);
  if (en) o.en = en.map(para);
  if (sr) o.sr = sr.map(para);
  return o;
};

const ref = (id) => ({_type: "reference", _ref: id, _key: key()});

const P = "[PLACEHOLDER]";

// --- 3. Documents ---
const topics = [
  {
    _id: "topic-post-yugoslav",
    _type: "topic",
    title: loc(
      `${P} Постјугословенска книжевност`,
      `${P} Post-Yugoslav literature`,
      `${P} Postjugoslovenska književnost`,
    ),
    slug: {_type: "slug", current: "placeholder-post-yugoslav-literature"},
  },
  {
    _id: "topic-translation",
    _type: "topic",
    title: loc(`${P} Превод`, `${P} Translation`, `${P} Prevod`),
    slug: {_type: "slug", current: "placeholder-translation"},
  },
  {
    _id: "topic-science-fiction",
    _type: "topic",
    title: loc(`${P} Научна фантастика`, `${P} Science fiction`, `${P} Naučna fantastika`),
    slug: {_type: "slug", current: "placeholder-science-fiction"},
  },
  {
    _id: "topic-identity",
    _type: "topic",
    title: loc(`${P} Идентитет`, `${P} Identity`, `${P} Identitet`),
    slug: {_type: "slug", current: "placeholder-identity"},
  },
];

const posts = [
  {
    _id: "post-translation-as-reading",
    _type: "post",
    title: loc(
      `${P} Преводот како читање`,
      `${P} Translation as a way of reading`,
      `${P} Prevod kao način čitanja`,
    ),
    slug: {_type: "slug", current: "placeholder-translation-as-reading"},
    excerpt: loc(
      `${P} Кратка белешка за тоа како преводот е најбавната форма на читање.`,
      `${P} A short note on translation as the slowest form of reading.`,
      `${P} Kratka beleška o prevodu kao najsporijem obliku čitanja.`,
    ),
    body: locBlocks(
      [`${P} Ова е placeholder-параграф за блог-запис. Вистинската содржина доаѓа во фаза 2.01.`],
      [`${P} This is a placeholder paragraph for a blog post. Real content arrives in phase 2.01.`],
      [`${P} Ovo je placeholder pasus za blog zapis. Pravi sadržaj stiže u fazi 2.01.`],
    ),
    topics: [ref("topic-translation"), ref("topic-identity")],
    publishedAt: "2026-05-20T09:00:00Z",
  },
  {
    _id: "post-notes-on-science-fiction",
    _type: "post",
    title: loc(
      `${P} Белешки за научната фантастика`,
      `${P} Notes on science fiction`,
      `${P} Beleške o naučnoj fantastici`,
    ),
    slug: {_type: "slug", current: "placeholder-notes-on-science-fiction"},
    excerpt: loc(
      `${P} Зошто жанрот сè уште е добар начин да се мисли за иднината.`,
      `${P} Why the genre is still a good way to think about the future.`,
      `${P} Zašto je žanr i dalje dobar način da se misli o budućnosti.`,
    ),
    body: locBlocks(
      [`${P} Placeholder-текст. ${P} Втор параграф за да се види ритамот на читање.`],
      [`${P} Placeholder text. ${P} A second paragraph so the reading rhythm is visible.`],
      [`${P} Placeholder tekst. ${P} Drugi pasus da se vidi ritam čitanja.`],
    ),
    topics: [ref("topic-science-fiction")],
    publishedAt: "2026-04-10T09:00:00Z",
  },
  {
    _id: "post-memory-and-the-city",
    _type: "post",
    title: loc(`${P} Меморија и град`, `${P} Memory and the city`, `${P} Memorija i grad`),
    slug: {_type: "slug", current: "placeholder-memory-and-the-city"},
    excerpt: loc(
      `${P} Како градовите паметат повеќе отколку што признаваат.`,
      `${P} How cities remember more than they admit.`,
      `${P} Kako gradovi pamte više nego što priznaju.`,
    ),
    body: locBlocks(
      [`${P} Placeholder-параграф за записот „Меморија и град“.`],
      [`${P} Placeholder paragraph for the "Memory and the city" post.`],
      [`${P} Placeholder pasus za zapis „Memorija i grad“.`],
    ),
    topics: [ref("topic-identity"), ref("topic-post-yugoslav")],
    publishedAt: "2026-03-01T09:00:00Z",
  },
];

const reviews = [
  {
    _id: "review-essay-on-silence",
    _type: "review",
    reviewTitle: loc(
      `${P} Есеј за тишината`,
      `${P} An essay on silence`,
      `${P} Esej o tišini`,
    ),
    slug: {_type: "slug", current: "placeholder-essay-on-silence"},
    // The single placeholder cover — imported from the local file (see _sanityAsset).
    coverImage: {
      _type: "localizedImage",
      _sanityAsset: "image@file://./placeholder-cover.png",
      alt: loc(
        `${P} Корица — пример`,
        `${P} Cover — placeholder`,
        `${P} Korica — primer`,
      ),
    },
    bookTitle: loc(`${P} Тишина`, `${P} Silence`, `${P} Tišina`),
    bookAuthor: `${P} Marko Pogačar`,
    publisher: `${P} Booksa`,
    publicationYear: 2023,
    isbn: "000-0-00-000000-0",
    excerpt: loc(
      `${P} Книга што бара бавно читање и внимание на секоја пауза.`,
      `${P} A book that asks for slow reading and attention to every pause.`,
      `${P} Knjiga koja traži sporo čitanje i pažnju na svaku pauzu.`,
    ),
    body: locBlocks(
      [`${P} Placeholder-текст на рецензијата. Вистинскиот текст доаѓа во 2.01.`],
      [`${P} Placeholder review text. The real text arrives in 2.01.`],
      [`${P} Placeholder tekst recenzije. Pravi tekst stiže u 2.01.`],
    ),
    topics: [ref("topic-post-yugoslav"), ref("topic-translation")],
    source: {
      sourceName: `${P} Booksa`,
      sourceUrl: "https://example.com/placeholder-source",
    },
    publishedAt: "2026-05-15T09:00:00Z",
  },
  {
    _id: "review-between-two-languages",
    _type: "review",
    reviewTitle: loc(
      `${P} Помеѓу два јазика`,
      `${P} Between two languages`,
      `${P} Između dva jezika`,
    ),
    slug: {_type: "slug", current: "placeholder-between-two-languages"},
    bookTitle: loc(`${P} Двојник`, `${P} The Double`, `${P} Dvojnik`),
    bookAuthor: `${P} Kalina Maleska`,
    publisher: `${P} Templum`,
    publicationYear: 2024,
    excerpt: loc(
      `${P} За тоа што се губи и што се добива меѓу два јазика.`,
      `${P} On what is lost and gained between two languages.`,
      `${P} O onome što se gubi i dobija između dva jezika.`,
    ),
    body: locBlocks(
      [`${P} Placeholder-текст. Оваа рецензија нема корица (no-image state).`],
      [`${P} Placeholder text. This review has no cover (no-image state).`],
      [`${P} Placeholder tekst. Ova recenzija nema koricu (no-image state).`],
    ),
    topics: [ref("topic-translation"), ref("topic-identity")],
    publishedAt: "2026-04-22T09:00:00Z",
  },
  {
    _id: "review-travels-of-memory",
    _type: "review",
    reviewTitle: loc(
      `${P} Патувања на сеќавањето`,
      `${P} Travels of memory`,
      `${P} Putovanja sećanja`,
    ),
    slug: {_type: "slug", current: "placeholder-travels-of-memory"},
    bookTitle: loc(`${P} Слепи патници`, `${P} Blind travellers`, `${P} Slepi putnici`),
    bookAuthor: `${P} Rade Jarak`,
    publisher: `${P} Sandorf`,
    publicationYear: 2023,
    excerpt: loc(
      `${P} Низ Европа полу-запаметена, полу-измислена.`,
      `${P} Through a Europe half-remembered, half-invented.`,
      `${P} Kroz Evropu polu-upamćenu, polu-izmišljenu.`,
    ),
    body: locBlocks(
      [`${P} Placeholder-текст за рецензијата „Патувања на сеќавањето“.`],
      [`${P} Placeholder text for the "Travels of memory" review.`],
      [`${P} Placeholder tekst za recenziju „Putovanja sećanja“.`],
    ),
    topics: [ref("topic-post-yugoslav")],
    publishedAt: "2026-03-18T09:00:00Z",
  },
  {
    // Macedonian-only — proves the fallback + the "available in: MK" indicator.
    _id: "review-mk-only",
    _type: "review",
    reviewTitle: loc(`${P} Само на македонски`),
    slug: {_type: "slug", current: "placeholder-mk-only-review"},
    bookTitle: loc(`${P} Книга без превод`),
    bookAuthor: `${P} Danilo Stojić`,
    publisher: `${P} Или-Или`,
    publicationYear: 2022,
    excerpt: loc(`${P} Оваа рецензија намерно постои само на македонски.`),
    body: locBlocks([
      `${P} Оваа рецензија е само на македонски. На /en и /sr треба да се прикаже македонскиот наслов преку fallback, со ознака „Достапно на: MK“.`,
    ]),
    topics: [ref("topic-identity")],
    // Dated as the newest review so it lands in Home's "latest 3" window — this
    // is what exercises the mk→en→sr fallback + "available in: MK" note on Home
    // (on /en and /sr). Realistic, too: a freshly-published review often exists
    // in Macedonian first.
    publishedAt: "2026-06-01T09:00:00Z",
  },
];

const book = {
  _id: "book",
  _type: "book",
  title: loc(`${P} Буники`, `${P} Bunike`, `${P} Bunike`),
  tagline: loc(
    `${P} Прозен деби-наслов`,
    `${P} A prose debut`,
    `${P} Prozni debi`,
  ),
  // genre intentionally left UNSET — sources disagree (novel vs. story
  // collection); resolved with Dalibor in 2.01. The field exists in the schema
  // (editable) but is never seeded. Do not add a hardcoded genre/format here.
  description: locBlocks(
    [
      `${P} Ова е placeholder-опис на книгата на Далибор. Вистинскиот текст и податоците за книгата доаѓаат во фаза 2.01.`,
      `${P} Втор placeholder-параграф — тука ќе стои подолг опис на книгата, за да се види ритамот на читање во колоната за текст.`,
      `${P} Трет placeholder-параграф. Ниту еден податок овде не е вистинит додека не се потврди со Далибор.`,
    ],
    [
      `${P} This is a placeholder description of Dalibor's book. The real text and book facts arrive in phase 2.01.`,
      `${P} A second placeholder paragraph — a longer description of the book sits here so the reading rhythm of the text column is visible.`,
      `${P} A third placeholder paragraph. None of this is real until confirmed with Dalibor.`,
    ],
    [
      `${P} Ovo je placeholder opis Daliborove knjige. Pravi tekst i podaci o knjizi stižu u fazi 2.01.`,
      `${P} Drugi placeholder pasus — ovde stoji duži opis knjige, da se vidi ritam čitanja u koloni sa tekstom.`,
      `${P} Treći placeholder pasus. Ništa od ovoga nije stvarno dok se ne potvrdi sa Daliborom.`,
    ],
  ),
  publisher: `${P} PNV Publikacii`,
  publicationYear: 2022,
  isbn: "",
  purchaseLinks: [
    {
      _key: key(),
      _type: "purchaseLink",
      label: loc(`${P} Купи онлајн`, `${P} Buy online`, `${P} Kupi onlajn`),
      url: "https://example.com/placeholder-buy",
    },
  ],
};

const author = {
  _id: "author",
  _type: "author",
  name: loc(`${P} Далибор Плечиќ`, `${P} Dalibor Plečić`, `${P} Далибор Плечић`),
  roles: loc(
    `${P} критичар, преведувач, писател`,
    `${P} critic, translator, writer`,
    `${P} kritičar, prevodilac, pisac`,
  ),
  tagline: loc(
    `${P} Писател, книжевен критичар и преведувач — читање низ јазиците на поранешна Југославија и пошироко.`,
    `${P} Writer, literary critic, and translator — reading across the languages of the former Yugoslavia and beyond.`,
    `${P} Pisac, književni kritičar i prevodilac — čitanje kroz jezike bivše Jugoslavije i šire.`,
  ),
  heroIntro: loc(
    `${P} Книжевни критики, преводи и една моја книга, собрани на едно место.`,
    `${P} Book reviews, translations, and a book of my own, gathered in one place.`,
    `${P} Književne kritike, prevodi i jedna moja knjiga, sabrani na jednom mestu.`,
  ),
  shortBio: loc(
    `${P} Кратка био за почетна/подножје.`,
    `${P} Short bio for the home page / footer.`,
    `${P} Kratka bio za početnu / podnožje.`,
  ),
  bio: locBlocks(
    [
      `${P} Ова е placeholder-биографија на Далибор Плечиќ. Вистинскиот текст доаѓа во фаза 2.02.`,
      `${P} Втор placeholder-параграф — тука ќе стои подолг разказ за неговото пишување, преводи и критика, за да се види двоколонскиот распоред.`,
      `${P} Трет placeholder-параграф. Сите податоци овде се привремени додека не се потврдат со Далибор.`,
    ],
    [
      `${P} This is a placeholder biography of Dalibor Plečić. The real text arrives in phase 2.02.`,
      `${P} A second placeholder paragraph — a longer account of his writing, translation, and criticism sits here so the two-column layout is visible.`,
      `${P} A third placeholder paragraph. Everything here is provisional until confirmed with Dalibor.`,
    ],
    [
      `${P} Ovo je placeholder biografija Dalibora Plečića. Pravi tekst stiže u fazi 2.02.`,
      `${P} Drugi placeholder pasus — ovde stoji duži prikaz njegovog pisanja, prevoda i kritike, da se vidi raspored u dve kolone.`,
      `${P} Treći placeholder pasus. Sve ovde je privremeno dok se ne potvrdi sa Daliborom.`,
    ],
  ),
  socialLinks: [
    {_key: key(), _type: "socialLink", platform: `${P} Booksa`, url: "https://example.com/placeholder-booksa"},
    {_key: key(), _type: "socialLink", platform: `${P} Instagram`, url: "https://example.com/placeholder-instagram"},
  ],
  email: "",
};

// --- 4. Write outputs ---
const docs = [...topics, ...posts, ...reviews, book, author];
const ndjson = docs.map((doc) => JSON.stringify(doc)).join("\n") + "\n";
writeFileSync(join(here, "seed.ndjson"), ndjson, "utf8");
const pngBytes = writePlaceholderCover();

console.log(
  `Wrote seed.ndjson (${docs.length} documents) and placeholder-cover.png (${pngBytes} bytes).`,
);
