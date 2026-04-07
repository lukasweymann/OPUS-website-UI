import styles from "./page.module.css";

export default function OPUSTools() {
  return (
    <div className={styles.opusToolsContainer}>
      <h2 className={styles.mainTitle}>The OPUS ecosystem</h2>
      <p>Tools for finding and processing OPUS data sets:</p>
      <ul>
        <li>
          <a href="https://github.com/Helsinki-NLP/OpusTools">OpusTools</a> -
          Python library and tools for accessing and processing OPUS data [
          <a href="https://pypi.org/project/opustools/" rel="nofollow">
            pip
          </a>
          ]
        </li>
        <li>
          <a href="https://github.com/Helsinki-NLP/OpusTools-perl">
            OpusTools-perl
          </a>{" "}
          - Perl scripts for processing OPUS data
        </li>
        <li>
          <a href="https://github.com/Helsinki-NLP/OPUS-API">OPUS-API</a> - API
          for searching OPUS resources [
          <a href="https://opus.nlpl.eu/opusapi/" rel="nofollow">
            live API
          </a>
          ]
        </li>
        <li>
          <a href="https://github.com/Helsinki-NLP/OpusFilter">OpusFilter</a> -
          a toolbox for filtering and compiling parallel corpora [
          <a href="https://helsinki-nlp.github.io/OpusFilter/" rel="nofollow">
            doc
          </a>
          ] [
          <a href="https://pypi.org/project/opusfilter/" rel="nofollow">
            pip
          </a>
          ]
        </li>
        <li>
          <a href="https://opus.nlpl.eu/bin/opuscqp.pl" rel="nofollow">
            OPUS-search
          </a>{" "}
          - online search in OPUS data [
          <a
            href="https://opus.nlpl.eu/cwb/Europarl7/frames-cqp.html"
            rel="nofollow"
          >
            Europarl v7
          </a>
          ] [
          <a
            href="https://opus.nlpl.eu/cwb/Europarl/frames-cqp.html"
            rel="nofollow"
          >
            Europarl v3
          </a>
          ] [
          <a
            href="https://opus.nlpl.eu/cwb/OpenSubtitles/frames-cqp.html"
            rel="nofollow"
          >
            OpenSubtitles v1
          </a>
          ] [
          <a
            href="https://opus.nlpl.eu/cwb/OpenSubtitles2018/frames-cqp.html"
            rel="nofollow"
          >
            OpenSubtitles v2018
          </a>
          ] [
          <a
            href="https://opus.nlpl.eu/cwb/EUconst/frames-cqp.html"
            rel="nofollow"
          >
            EUconst
          </a>
          ]
        </li>
        <li>
          <a href="https://opus.nlpl.eu/lex.php" rel="nofollow">
            OPUS-dic
          </a>{" "}
          - online dictionary based on word alignments
        </li>
      </ul>
      <p>Managing OPUS:</p>
      <ul>
        <li>
          <a href="https://github.com/Helsinki-NLP/OPUS-ingest">OPUS-ingest</a>{" "}
          - recipes for ingesting/importing data to OPUS
        </li>
        <li>
          <a href="https://github.com/Helsinki-NLP/OPUS-website">
            OPUS-website
          </a>{" "}
          - OPUS website and corpus sample files
        </li>
        <li>
          <a href="https://github.com/Helsinki-NLP/OPUS-admin">OPUS-admin</a> -
          scripts and recipes for admin tasks (restricted access)
        </li>
        <li>
          <a href="https://opus-repository.ling.helsinki.fi" rel="nofollow">
            OPUS-repository
          </a>{" "}
          - parallel data management system [
          <a href="https://github.com/Helsinki-NLP/OPUS-interface">frontend</a>]
          [<a href="https://github.com/Helsinki-NLP/OPUS-repository">backend</a>
          ] [
          <a href="https://opus-repository.ling.helsinki.fi" rel="nofollow">
            live demo
          </a>
          ]
        </li>
        <li>
          <a href="https://github.com/Helsinki-NLP/OPUS-ISA">OPUS-ISA</a> -
          experimental sentence alignment interface [
          <a href="https://opus.nlpl.eu/isa/isa.php" rel="nofollow">
            live demo
          </a>
          ]
        </li>
      </ul>
      <p>Machine translation with OPUS-MT:</p>
      <ul>
        <li>
          <a href="https://github.com/Helsinki-NLP/Opus-MT">Opus-MT</a> -
          OPUS-MT web service setup
        </li>
        <li>
          <a href="https://github.com/Helsinki-NLP/OPUS-MT-train">
            OPUS-MT-train
          </a>{" "}
          - scripts and recipes for training OPUS-MT models
        </li>
        <li>
          <a href="https://github.com/Helsinki-NLP/OPUS-translator">
            OPUS-translator
          </a>{" "}
          - OPUS-MT web interface [
          <a href="https://translate.ling.helsinki.fi/" rel="nofollow">
            live demo
          </a>
          ]
        </li>
        <li>
          <a href="https://github.com/Helsinki-NLP/OPUS-MT-testsets">
            OPUS-MT-testsets
          </a>{" "}
          - a collection of MT benchmarks
        </li>
        <li>
          <a href="https://github.com/Helsinki-NLP/OPUS-MT-leaderboard">
            OPUS-MT-leaderboard
          </a>{" "}
          - OPUS-MT evaluation scores and leaderboards [
          <a href="https://opus.nlpl.eu/mt/" rel="nofollow">
            live demo
          </a>
          ]
        </li>
        <li>
          <a href="https://github.com/Helsinki-NLP/OPUS-MT-map">OPUS-MT-map</a>{" "}
          - interactive map of OPUS-MT language coverage [
          <a
            href="https://opus.nlpl.eu/NMT-map/Tatoeba-all/src2trg/index.html"
            rel="nofollow"
          >
            live demo
          </a>
          ]
        </li>
        <li>
          <a href="https://github.com/Helsinki-NLP/OPUS-MT-app">OPUS-MT-app</a>{" "}
          - desktop app for local translation with OPUS-MT (fork of{" "}
          <a href="https://github.com/XapaJIaMnu/translateLocally">
            translateLocally
          </a>
          )
        </li>
        <li>
          <a href="https://github.com/Helsinki-NLP/OPUS-CAT">OPUS-CAT</a> -
          OPUS-MT integration in CAT tools
        </li>
      </ul>
      <h2>Citing</h2>
      <p>
        Please, cite the following{" "}
        <a href="https://aclanthology.org/L12-1246/" rel="nofollow">
          LREC 2012 paper
        </a>{" "}
        when using OPUS and also acknowledge corpus-specific references as
        specified in the resource-specific information and documentation!
      </p>

      <h2>Links to other resources</h2>
      <ul>
        <li>
          <a href="https://github.com/thammegowda/mtdata">mtdata</a> - a library
          for retrieving MT datasets
        </li>
        <li>
          <a href="https://github.com/Helsinki-NLP/LanguageCodes">
            LanguageCodes
          </a>{" "}
          - Perl modules for managing language codes
        </li>
        <li>
          <a href="https://github.com/robertostling/eflomal">eflomal</a> - a
          tool for efficient word alignment with{" "}
          <a
            href="https://opus.nlpl.eu/legacy/eflomal-priors.html"
            rel="nofollow"
          >
            pre-trained priors from OPUS
          </a>
        </li>
        <li>
          <a href="https://github.com/Helsinki-NLP/Tatoeba-Challenge">
            the Tatoeba translation challenge
          </a>{" "}
          - a comprehensive MT dataset compiled from OPUS and Tatoeba
        </li>
        <li>
          <a href="https://github.com/Helsinki-NLP/Tatoeba-Challenge/blob/master/data/Backtranslations.md">
            wiki back-translations
          </a>{" "}
          - over a billion automatically translated sentences
        </li>
        <li>
          <a href="https://github.com/Helsinki-NLP/OPUS-MT-train/blob/master/tatoeba/SentencePieceModels.md">
            OPUS-SPM
          </a>{" "}
          - pre-trained sentence piece models from OPUS data
        </li>
      </ul>
      <h2>Acknowledgements</h2>
      <p>
        OPUS and related resources and tools have been partially supported by
        various projects such as
      </p>
      <ul>
        <li>
          <a href="http://project.letsmt.eu/" rel="nofollow">
            LetsMT!
          </a>{" "}
          - A Platform for Online Sharing of Training Data and Building User
          Tailored Machine Translation (EU ICT PSP)
        </li>
        <li>
          <a href="https://memad.eu/" rel="nofollow">
            MeMAD
          </a>{" "}
          - Methods for Managing Audiovisual Data (EU Horizon 2020)
        </li>
        <li>
          <a
            href="https://wiki.neic.no/wiki/Nordic_language_processing_laboratory"
            rel="nofollow"
          >
            NLPL
          </a>{" "}
          - the Nordic Language Processing Laboritory (neic)
        </li>
        <li>
          <a href="https://www.eosc-nordic.eu/" rel="nofollow">
            EOSC-nordic
          </a>{" "}
          - the European Open Science Cloud within the Nordic and Baltic
          countries (EU Horizon 2020)
        </li>
        <li>
          <a
            href="https://live.european-language-grid.eu/catalogue/project/2866"
            rel="nofollow"
          >
            ELG
          </a>{" "}
          - the European Language Grid (EU Horizon 2020)
        </li>
        <li>
          <a
            href="https://www.helsinki.fi/en/researchgroups/natural-language-understanding"
            rel="nofollow"
          >
            FoTran
          </a>{" "}
          - Found in Translation (EU ERC)
        </li>
        <li>
          <a href="https://hplt-project.org/" rel="nofollow">
            HPLT
          </a>{" "}
          - High-Performance Language Technologies (EU Horizon)
        </li>
      </ul>
      <p>
        OPUS is hosted by{" "}
        <a href="https://www.csc.fi" rel="nofollow">
          CSC
        </a>
        , the IT Center for Science in Finland, and heavily draws on the HPC
        resources provided by CSC. OPUS is also part of{" "}
        <a href="http://wiki.nlpl.eu" rel="nofollow">
          NLPL
        </a>
        , the Nordic Language Processing Laboratory. Last but not least, OPUS
        would not be possible without the various contributions from the
        community including aligned data sets and tools to create and process
        parallel corpora.
      </p>
    </div>
  );
}
