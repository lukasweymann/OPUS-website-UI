import Link from "next/link";
import {
  Braces,
  ExternalLink,
  FileArchive,
  Languages,
  Rows3,
} from "lucide-react";

import s from "./page.module.css";

export const metadata = {
  title: "Download formats - OPUS",
  description:
    "Reference for OPUS corpus download formats, including XML, plain text, Moses, TMX, and frequency files.",
};

const FORMAT_GROUPS = [
  {
    id: "monolingual-downloads",
    title: "Monolingual downloads",
    icon: FileArchive,
    items: [
      ["xml-raw", "Basic XML-encoded corpus files."],
      ["xml-tok", "Tokenized XML-encoded corpus files."],
      ["txt-raw", "Raw plain text files, one sentence per line."],
      ["txt-tok", "Tokenized plain text files, one sentence per line."],
      ["freq", "Token frequency lists when available."],
    ],
  },
  {
    id: "bilingual-downloads",
    title: "Bilingual downloads",
    icon: Languages,
    items: [
      ["moses", "Aligned plain text files."],
      ["TMX", "Translation memories in a standard exchange format."],
      ["XML", "Sentence alignments in XCES Align format."],
    ],
  },
];

function FormatGroup({ group }) {
  const Icon = group.icon;

  return (
    <section className={s.formatGroup} aria-labelledby={`${group.id}-title`}>
      <div className={s.groupHead}>
        <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
        <h2 id={`${group.id}-title`}>{group.title}</h2>
      </div>
      <dl className={s.formatList}>
        {group.items.map(([name, description]) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd>{description}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function CodeBlock({ children }) {
  return <pre className={s.code}>{children}</pre>;
}

export default function DataFormatsPage() {
  return (
    <main className={s.page}>
      <div className={s.container}>
        <header className={s.hero}>
          <p className={s.kicker}>OPUS reference</p>
          <h1>Download formats</h1>
          <p className={s.lead}>
            OPUS publishes corpus data in a few related formats. The native
            representation is XML; plain text, Moses, TMX, and frequency
            downloads are derived from those corpus files.
          </p>
          <div className={s.actions}>
            <Link href="/corpora" className={s.primary}>
              Browse corpora
            </Link>
            <a
              href="https://opus.nlpl.eu/legacy/trac/wiki/DataFormats.html"
              target="_blank"
              rel="noopener noreferrer"
              className={s.secondary}
            >
              <span>Legacy reference</span>
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          </div>
        </header>

        <section className={s.summary} aria-label="Format summary">
          {FORMAT_GROUPS.map((group) => (
            <FormatGroup key={group.title} group={group} />
          ))}
        </section>

        <section className={s.section} aria-labelledby="xml-title">
          <div className={s.sectionHead}>
            <Braces size={20} strokeWidth={1.8} aria-hidden="true" />
            <div>
              <p className={s.eyebrow}>Native corpus data</p>
              <h2 id="xml-title">XML files</h2>
            </div>
          </div>
          <p>
            OPUS corpus files are organized by corpus, processing level, and
            language. Untokenized files live in the raw layer, while tokenized
            XML files live in the XML layer. Sentence boundaries are kept
            compatible across those layers so they can be connected by
            alignment files.
          </p>
          <div className={s.twoCol}>
            <div>
              <h3>xml-raw</h3>
              <p>
                Use this when you want basic XML markup and original text as
                closely as possible after corpus segmentation.
              </p>
            </div>
            <div>
              <h3>xml-tok</h3>
              <p>
                Use this when you want XML files where tokens are represented
                explicitly, usually with token-level markup.
              </p>
            </div>
          </div>
          <CodeBlock>{`Corpus/raw/en/example.xml.gz
Corpus/xml/en/example.xml.gz
Corpus/xml/en-fr.xml.gz`}</CodeBlock>
        </section>

        <section className={s.section} aria-labelledby="align-title">
          <div className={s.sectionHead}>
            <Languages size={20} strokeWidth={1.8} aria-hidden="true" />
            <div>
              <p className={s.eyebrow}>Sentence alignment</p>
              <h2 id="align-title">Bilingual XML</h2>
            </div>
          </div>
          <p>
            Bilingual XML downloads contain standoff sentence alignments in
            XCES Align format. They reference source and target documents and
            connect sentence IDs with alignment links. Only one direction is
            stored for a language pair, so the filename order may be normalized
            rather than matching the direction you selected.
          </p>
          <CodeBlock>{`<linkGrp fromDoc="en/doc.xml.gz" toDoc="fr/doc.xml.gz">
  <link xtargets="1;1" />
  <link xtargets="2;2 3" />
</linkGrp>`}</CodeBlock>
        </section>

        <section className={s.section} aria-labelledby="text-title">
          <div className={s.sectionHead}>
            <Rows3 size={20} strokeWidth={1.8} aria-hidden="true" />
            <div>
              <p className={s.eyebrow}>Plain text</p>
              <h2 id="text-title">Text and Moses files</h2>
            </div>
          </div>
          <p>
            Plain text downloads are convenient when you want line-based data.
            Monolingual text files contain one sentence per line. Moses bitext
            downloads contain two files whose lines are aligned with each
            other; empty alignments are excluded.
          </p>
          <CodeBlock>{`Corpus.en-fr.en
Corpus.en-fr.fr`}</CodeBlock>
          <div className={s.twoCol}>
            <div>
              <h3>txt-raw</h3>
              <p>Untokenized plain text for a single language.</p>
            </div>
            <div>
              <h3>txt-tok</h3>
              <p>Tokenized plain text for a single language.</p>
            </div>
          </div>
        </section>

        <section className={s.section} aria-labelledby="tmx-title">
          <div className={s.sectionHead}>
            <FileArchive size={20} strokeWidth={1.8} aria-hidden="true" />
            <div>
              <p className={s.eyebrow}>Translation memory</p>
              <h2 id="tmx-title">TMX</h2>
            </div>
          </div>
          <p>
            TMX files package bilingual data as translation memory units. In
            OPUS they use minimal markup and raw text segments, making them
            useful for translation-memory tools and exchange workflows.
          </p>
          <CodeBlock>{`<tu>
  <tuv xml:lang="en"><seg>One source segment.</seg></tuv>
  <tuv xml:lang="fr"><seg>One target segment.</seg></tuv>
</tu>`}</CodeBlock>
        </section>
      </div>
    </main>
  );
}
