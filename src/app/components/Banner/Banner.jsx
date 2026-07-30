import Image from "next/image";
import SearchWithSuspense from "../Search/SearchWithSuspense";
import s from "./Banner.module.css";
import Logo from "@/../public/logos/banner-logo.png";
import LogoDark from "@/../public/logos/banner-logo-white.png";

export default function Banner() {
  return (
    <section className={s.wrap}>
      <div className={s.content}>
        <Image
          src={Logo}
          width={280}
          alt="opus logo"
          className={s.logo}
          data-hide-on-theme="dark"
        />
        <Image
          src={LogoDark}
          width={280}
          alt="opus logo"
          className={s.logo}
          data-hide-on-theme="light"
        />
        <div className={s.box}>
          <h1 className={s.title}>Find your corpora</h1>
          <SearchWithSuspense />
        </div>
      </div>
    </section>
  );
}
