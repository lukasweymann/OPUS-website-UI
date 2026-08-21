# OPUS website

This repo contains the redesigned OPUS website full code along with some documentation. 
It is based on Next.js that allow to create a full-stack Web applications by extending the latest React features, and integrate powerful Rust-based JavaScript tooling to speed up builds.

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can also check out [the Next.js GitHub repository](https://github.com/vercel/next.js/).


## Deploying the website using Docker

The default way prescribed to deploy this service is by using Docker containers. It is also possible to deploy the application just like any Node.js or Next.js application.

To build the Docker image the featured Dockerfile is used:

```shell
$ docker build -t opusweb:latest .
``` 

Now the server can be deployed using a `docker-compose.yml` that includes a `nginx` proxy and self-renewable LetsEncrypt SSL certificates like the following:
```
version: '3.9'

services:
  opusweb:
    container_name: opusweb
    image: opusweb:latest
    restart: unless-stopped
    environment:
      - VIRTUAL_HOST=opus.nlp.eu
      - VIRTUAL_PORT=3000
      - LETSENCRYPT_HOST=opus.nlp.eu
      - LETSENCRYPT_EMAIL=mail@domain.com
      - OPUS_EMAIL_SERVER=mail.domain.com
      - OPUS_EMAIL_USER=info@domain.com
      - OPUS_EMAIL_PASSWORD=password123
      - OPUS_EMAIL_RECEIVER=someguy@domain.com
      - OPUS_HCAPTCHA_SECRET=
      - OPUS_EMAIL_TLS_REJECT_UNAUTHORIZED=true
  
  nginx-proxy:
    image: jwilder/nginx-proxy
    container_name: nginx-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./certs:/etc/nginx/certs:ro
      - /var/run/docker.sock:/tmp/docker.sock:ro
    labels:
      - com.github.jrcs.letsencrypt_nginx_proxy_companion.nginx_proxy

  letsencrypt:
    image: jrcs/letsencrypt-nginx-proxy-companion
    container_name: nginx-proxy-le
    restart: unless-stopped
    volumes_from:
      - nginx-proxy
    volumes:
      - ./certs:/etc/nginx/certs:rw
      - /var/run/docker.sock:/var/run/docker.sock:ro
```

By executing the following Docker compose command:

```
$ docker-compose up -d # in newer Docker environments you might need to use `docker compose up -d` instead
``` 

## Local development

The local Node version is pinned in `.nvmrc`, and the package manager is pinned
in `package.json`.

With `nvm`:

```shell
$ nvm install
$ nvm use
$ corepack enable
$ corepack install
```

To prepare the local Python environment, development SQLite DBs, `.env.local`,
and Node dependencies:

```shell
$ ./bin/dev-bootstrap.sh
```

To refresh the local OPUS dev database during bootstrap:

```shell
$ ./bin/dev-bootstrap.sh --update-db
```

After bootstrapping:

```shell
$ source .venv/bin/activate
$ pnpm dev
```

## Building the service outside a Docker environment

To build the Next.js webapp you can run:

```
$ corepack enable
$ corepack install
$ pnpm install --frozen-lockfile
$ pnpm run build
```

And it will be locally available at http://localhost:3000

## Hardware requirements
The system build can deal with tenths of thousands of requests per minute without much server overload. As an orientation, the following requirements could be used

* *Minimal*: 4-thread CPU, 1 GB RAM, 10 GB hard disk
* *Recommended*: 16-thread CPU, 8 GB RAM, 10 GB hard disk.

## Website structure

The OPUS website is organised in 9 different pages: 

### 1) Homepage 
From top to bottom, the page includes a search composed of two dropdowns that lead to the /corpus-result-table (see 6.2). The search leads to a table showing all the corpora that include the languages searched. The dropdowns work with the languagelist coming from the OPUS API, they query to match target languages available for the source language selected in order to avoid empty results.
Underneath, on the left side, there are some important numbers about the OPUS collection. On the right, a treemap showing corpora (excluding ELRA and ELRC collections) and the size each of these corpora make up of the entire collection. 
Afterwards, there is the list of contributors, each of them linked to their respective website.
At the end, the footer shows some useful links related to the project. There is, of course, a link to the prior website for those who still prefer it.

### 2) Corpus result page 
This page shows the search results coming from either the selectors in the homepage or any other page (present on the navbar in the second case). One finds corpora containing the language pair searched, with the possibility to see a sample (see 6.3), on each row dropdowns are available to select the format and download it. 

### 3) Sample page: 
Sample page with a sample for a given corpus and language pair includes the possibility to see the sentences either horizontally or vertically to each other. Copy buttons available for each sentence and buttons to go back to the corpus in question.

### 4) Contribute page: 
A contact form to make it easy for people to get in touch on the go without the need to open their email. It has added captcha to avoid spam and bots.

### 5) Publications page: 
A simple page displaying publications related to the OPUS project, with buttons for PDF or to copy the BibTex when these data are available.

### 6) Corpora page:
A list of corpora with a brief description (separated from ELRA and ELRC collections, they have their own pages, 6.7 and 6.8 respectively) and a search input to find corpora faster. 

### 7) ELRA collection page:  
A list of all the ELRA corpora with a search input. 

### 8) ELRC collection page: 
A list of all the ELRC corpora with a search input. 

### 9) Corpus page: 
This page has an organised structure and is statically generated for each corpus. It displays a description and some stats of the corpus.
Underneath a bar graph follows showing the languages contained in this dataset. When hovering over each bar stats to each language can be seen. If a bar is clicked, underneath there will appear an equal bar graph displaying the language pairs that contain the language that was clicked. These bars show their own stats on hover. When clicking one of them, a table just like the one mentioned in 6.2 opens, this time only with results of the corpus in question. If more versions of said corpus are available, they will appear as new table rows. There are language selectors for this purpose as well. 
Upon availability of info for overlaps, a last graph will show displaying the overlap for this corpus with other corpora.


## Updates and maintenance

Please, do notice that this website is a hybrid between static pages and dynamically retrieved data, where the biggest part is statically generated data at build time for improved SEO, so whenever an update is made, it is required to rebuild the website. Knowing this, the best approach would be to bulk upload updates and create a new build. More on that later.

A rebuild takes several minutes, but since it consists on building a new Docker image, restarts will take virtually no downtime.

### Automatic OPUS DB refresh

The website API and the statically generated corpus pages depend on the local
OpusTools SQLite DB. The API can only see fresh corpus data after that DB has
been updated, and dedicated corpus pages only appear after the Next.js app is
rebuilt with the updated DB.

For low-maintenance operation, use:

```shell
$ make auto-refresh
```

This command is intentionally conservative:

- it updates a candidate copy at `data/opus/opusdata.candidate.db`
- it validates the candidate DB before touching the live host DB
- it compares the old and updated corpus lists
- it rebuilds/redeploys Docker only when corpora were added or removed
- it leaves the currently running container untouched while the DB update runs

On a new server, if `data/opus/opusdata.db` does not exist yet, the command will
seed a candidate DB, run the real OpusTools update on it, validate it, promote it
to `data/opus/opusdata.db`, build the Docker image, and start the app.

To test locally before enabling a timer:

```shell
$ bash -n bin/auto-refresh-opus-db.sh
$ make -n auto-refresh
$ make auto-refresh
```

The first real run may take over an hour because the OpusTools DB update is
long. A second run, when no corpora changed, should update a candidate DB,
detect the same corpus-list hash, and skip the app rebuild/redeploy.

For unattended production use, run `make auto-refresh` daily with systemd or
cron. A systemd timer example is available in `docs/auto-refresh.md`.

### Parts of the website that could need regular updating: 

#### 1) News section in the landing page:
We have crafted a similar approach for all the data that need regular updating. 
The news appearing on the landing page portray newly added corpora and releases. This section is built statically based on the info available at https://github.com/Helsinki-NLP/OPUS/info/news.yaml . When editing this file to incorporate addtional news, please take into account this:

- In case the new addittion will come from the OPUS API (remember to add it to the corpora list as well, with a brief description, see point number 3), wrap the new corpus name in an html `<a></a>` tag and follow the pattern `<corpusname>/corpus/version/<corpusname>` for the `href` attribute (see code below)
- In case the new addition does NOT come from the OPUS API, simply add the external link to the `href` attribute.

Also, please, add the release date.

And, do not forget to add the information for the corpus description (see point 4)

As the landing page is statically generated during build time, any update will require a build.

```
NEWS:
  - name: "<a href=MDN_Web_Docs/corpus/version/MDN_Web_Docs >MDN_Web_Docs</a>"
    release_date: "2023-09-25"
  - name: "<a href=NLLB/corpus/version/NLLB>NLLB</a>"
    release_date: "2023-09-07"
  - name: "<a href=https://github.com/Helsinki-NLP/OPUS target=_blank rel=noreferrer>
    OPUS on GitHub</a>"
    release_date: ""
  - name: "<a href=liv4ever/corpus/version/liv4ever>Liv4ever</a> 
    and <a href=ELITR-ECA/corpus/version/ELITR-ECA>ELITR-ECA</a>"
    release_date: "2021-12-08"
```

#### 2) Publications 

The publications page under `/publications` shows all the publications related to the OPUS project. This page is statically generated based on the yaml file located in the OPUS repository under https://github.com/Helsinki-NLP/OPUS/info/publications.yaml which (see code below). It follows a similar pattern to the news section. You need to edit it to add new publications, ideally adding the info in the template provided below. If one piece of information, e.g. bibtex, is not available, just leave it empty, but leave all the fields present. It will simply not be displayed in the newly added publication.
Please do notice the bibtex `has to be encoded to base64`, this is necessary in order to be able to 
have a button to copy the properly formatted bibtex. The fastest way to produce it is to use any online service like https://www.base64encode.org/. To add an ID, just follow the increasing pattern. 

As this page is statically generated during build time, so any update will require a build.

```
PUBLICATIONS:
  - title: "Parallel Data, Tools and Interfaces in OPUS"
    where: "In Proceedings of the 8th International Conference on Language Resources and Evaluation (LREC'2012)"
    authors: "Jörg Tiedemann"
    date: "2012"
    pdf: "http://www.lrec-conf.org/proceedings/lrec2012/pdf/463_Paper.pdf"
    paperLink: "https://aclanthology.org/L12-1246/"
    bibtex: "QGlucHJvY2VlZGluZ3N7dGllZGVtYW5uLTIwMTItcGFyYWxsZWwsCiAgICB0aXRsZSA9ICJQYXJhbGxlbCBEYXRhLCBUb29scyBhbmQgSW50ZXJmYWNlcyBpbiB7T1BVU30iLAogICAgYXV0aG9yID0ge1RpZWRlbWFubiwgSntcIm99cmd9LAogICAgYm9va3RpdGxlID0gIlByb2NlZWRpbmdzIG9mIHRoZSBFaWdodGggSW50ZXJuYXRpb25hbCBDb25mZXJlbmNlIG9uIExhbmd1YWdlIFJlc291cmNlcyBhbmQgRXZhbHVhdGlvbiAoe0xSRUN9JzEyKSIsCiAgICBtb250aCA9IG1heSwKICAgIHllYXIgPSAiMjAxMiIsCiAgICBhZGRyZXNzID0gIklzdGFuYnVsLCBUdXJrZXkiLAogICAgcHVibGlzaGVyID0gIkV1cm9wZWFuIExhbmd1YWdlIFJlc291cmNlcyBBc3NvY2lhdGlvbiAoRUxSQSkiLAogICAgdXJsID0gImh0dHA6Ly93d3cubHJlYy1jb25mLm9yZy9wcm9jZWVkaW5ncy9scmVjMjAxMi9wZGYvNDYzX1BhcGVyLnBkZiIsCiAgICBwYWdlcyA9ICIyMjE0LS0yMjE4IiwKICAgIGFic3RyYWN0ID0gIlRoaXMgcGFwZXIgcHJlc2VudHMgdGhlIGN1cnJlbnQgc3RhdHVzIG9mIE9QVVMsIGEgZ3Jvd2luZyBsYW5ndWFnZSByZXNvdXJjZSBvZiBwYXJhbGxlbCBjb3Jwb3JhIGFuZCByZWxhdGVkIHRvb2xzLiBUaGUgZm9jdXMgaW4gT1BVUyBpcyB0byBwcm92aWRlIGZyZWVseSBhdmFpbGFibGUgZGF0YSBzZXRzIGluIHZhcmlvdXMgZm9ybWF0cyB0b2dldGhlciB3aXRoIGJhc2ljIGFubm90YXRpb24gdG8gYmUgdXNlZnVsIGZvciBhcHBsaWNhdGlvbnMgaW4gY29tcHV0YXRpb25hbCBsaW5ndWlzdGljcywgdHJhbnNsYXRpb24gc3R1ZGllcyBhbmQgY3Jvc3MtbGluZ3Vpc3RpYyBjb3JwdXMgc3R1ZGllcy4gSW4gdGhpcyBwYXBlciwgd2UgcmVwb3J0IGFib3V0IG5ldyBkYXRhIHNldHMgYW5kIHRoZWlyIGZlYXR1cmVzLCBhZGRpdGlvbmFsIGFubm90YXRpb24gdG9vbHMgYW5kIG1vZGVscyBwcm92aWRlZCBmcm9tIHRoZSB3ZWJzaXRlIGFuZCBlc3NlbnRpYWwgaW50ZXJmYWNlcyBhbmQgb24tbGluZSBzZXJ2aWNlcyBpbmNsdWRlZCBpbiB0aGUgcHJvamVjdC4iLAp9Cg=="
    id: 1
    
```
  
#### 3) Corpora page

The page under `/corpora` shows a list of corpora with a brief description. e.g. "Anuvaad - links for popular indian languages". This page does not include corpora that belong to the ELRC and ELRA collections. They have separate pages for practical reasons. 

When a new corpus is added or released, and you want it to appear in this page, simply update the file in the OPUS repository under https://github.com/Helsinki-NLP/OPUS/info/corpora.yaml . This page is statically generated during build time, so any update will require a build. Do not forget the information for the corpus description (see point 4)

```
CORPORA_LIST:
  - corpus: "ALT"
    desc: "20k Myanmar-English parallel sentences"
  - corpus: "Anuvaad"
    desc: " links for popular Indian languages"
  - corpus: "Bianet"
    desc: "Translated Turkish articles (tr, ku, en)"
  - corpus: "Books"
    desc: "A collection of translated literature"
```

#### 4) Single corpus page

Every corpus coming from the OPUS API under https://opus.nlpl.eu/opusapi/?corpora=True gets a hybrid page generated at build time for improved SEO and performance. When a new corpus is added, it is important to add the data related to its description and statistics, so that it can be displayed in its single page that will be automatically generated during build time.

This data lives in the OPUS repository in quite a similar fashion to the other parts of the website seen before. You will find the file you need to edit (or create) under `https://github.com/Helsinki-NLP/OPUS/blob/main/corpus/<corpusname>/info.yaml`

As seen in the example below, if you wish the bibtex to be visible, please simply intruduce it inside the `cite` field inside of `<pre></pre>` tags. Do not do this inside the bibtex field. The bibtex field expects a base64 encoded version of the same bibtex in order for it to be passed to the copy to clipboard button. Failing to respect this pattern could break that corpus page. The fastest would be to use any online service like https://www.base64encode.org/ to produce it. 

```
contact: empty
copyright: <a href="https://elrc-share.eu/repository/browse/scipar-a-collection-of-parallel-corpora-from-scientific-abstracts-v-2021-in-tmx-format/aaf503c0739411ec9c1a00155d02670665aacff53a8543938cd99da54fdd66af/" target="_blank">Check details at ELRC share</a>
latest_release: v1
license: CC-BY-NC-SA-4.0
name: ELRC-5067-SciPar
releases:
  v1: Sat Nov 12 14:02:11 EET 2022
website: http://opus.nlpl.eu/ELRC-5067-SciPar.php
description: >
  SciPar is a collection of parallel corpora constructed from parallel titles and abstracts of theses and dissertations, based on the openly available metadata on institutional repositories, digital libraries of universities, and national archives. The updated version (with Ukrainian repositories) consists of 9.73M sentence pairs in 33 language pairs (covering 26 languages).  <br/>
  ELRC-5067-SciPar is a public data set distributed by the https://www.elrc-share.eu   <br/>
  <h3>Non-standard license:</h3>
  The vast majority of the texts that were acquired and processed in order to create SciPar are provided under Creative Commons (CC) licenses. It should be noted that although the texts of some theses and dissertations are copyrighted or do not allow derivative works, the titles and abstracts by themselves constitute freely and publicly available metadata.
bibtex: >
 ICBASW5Qcm9jZWVkaW5nc3tyb3Vzc2lzLUV0QWw6MjAyMjpMUkVDMiwKICAgIGF1dGhvciA9IHtSb3Vzc2lzLCBEaW1pdHJpb3MgYW5kIFBhcGF2YXNzaWxpb3UsIFZhc3NpbGlzIGFuZCBQcm9rb3BpZGlzLCBQcm9rb3BpcyBhbmQgUGlwZXJpZGlzLCBTdGVsaW9zIGFuZCBLYXRzb3Vyb3MsIFZhc3NpbGlzfSwKICAgIHRpdGxlID0ge1NjaVBhcjogQSBDb2xsZWN0aW9uIG9mIFBhcmFsbGVsIENvcnBvcmEgZnJvbSBTY2llbnRpZmljIEFic3RyYWN0c30sCiAgICBib29rdGl0bGUgPSB7UHJvY2VlZGluZ3Mgb2YgdGhlIFRoaXJ0ZWVudGggTGFuZ3VhZ2UgUmVzb3VyY2VzIGFuZCBFdmFsdWF0aW9uIENvbmZlcmVuY2V9LAogICAgbW9udGggPSB7SnVuZX0sCiAgICB5ZWFyID0gezIwMjJ9LAogICAgYWRkcmVzcyA9IHtNYXJzZWlsbGUsIEZyYW5jZX0sCiAgICBwdWJsaXNoZXIgPSB7RXVyb3BlYW4gTGFuZ3VhZ2UgUmVzb3VyY2VzIEFzc29jaWF0aW9ufSwKICAgIHBhZ2VzID0gezI2NTItLTI2NTd9LAogICAgdXJsID0ge2h0dHBzOi8vYWNsYW50aG9sb2d5Lm9yZy8yMDIyLmxyZWMtMS4yODR9CiAgfQ==
cite: >
  Please, cite:
  <pre>
  @InProceedings{roussis-EtAl:2022:LREC2,
    author = {Roussis, Dimitrios and Papavassiliou, Vassilis and Prokopidis, Prokopis and Piperidis, Stelios and Katsouros, Vassilis},
    title = {SciPar: A Collection of Parallel Corpora from Scientific Abstracts},
    booktitle = {Proceedings of the Thirteenth Language Resources and Evaluation Conference},
    month = {June},
    year = {2022},
    address = {Marseille, France},
    publisher = {European Language Resources Association},
    pages = {2652--2657},
    url = {https://aclanthology.org/2022.lrec-1.284}
  }
  </pre>
  Please acknowledge the <a href="https://elrc-share.eu/repository/browse/scipar-a-collection-of-parallel-corpora-from-scientific-abstracts-v-2021-in-tmx-format/aaf503c0739411ec9c1a00155d02670665aacff53a8543938cd99da54fdd66af/" target="_blank">original sources and providers</a> of the data and also cite the <a href="https://opus.nlpl.eu/LREC2012.txt" target="_blank">following article</a> if you use any part of the corpus in your own work:
  J. Tiedemann, 2012, <a href="http://www.lrec-conf.org/proceedings/lrec2012/pdf/463_Paper.pdf" target="blank"> Parallel Data, Tools and Interfaces in OPUS</a>. In Proceedings of the 8th International Conference on Language Resources and Evaluation (LREC 2012
number_of_languages: 25
bitexts: 31
number_of_files: 62
total_number_of_tokens: 457.76M
total_sentence_fragments: 17.75M

```
