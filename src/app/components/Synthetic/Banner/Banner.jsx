import Image from "next/image";
import s from "./Banner.module.css";

import BannerLogo from "@/../public/logos-synth/logo-light.png";
import BannerLogoWhite from "@/../public/logos-synth/logo-dark.png";

export default function SyntheticBanner() {
  return (
    <section className={s.banner}>
      <div className={s.inner}>
        <Image
          src={BannerLogo}
          width={280}
          alt="synOPUS logo"
          className={s.logo}
          data-hide-on-theme="dark"
          priority
        />
        <Image
          src={BannerLogoWhite}
          width={280}
          alt="synOPUS logo"
          className={s.logo}
          data-hide-on-theme="light"
          priority
        />

        <div className={s.text}>
          <p className={s.kicker}>Synthetic datasets</p>
          <h1 className={s.title}>The synthetic open parallel corpus</h1>
          <p className={s.sub}>
            Automatically generated and processed corpora for MT and LLM
            workflows.
          </p>
        </div>
      </div>
    </section>
  );
}
