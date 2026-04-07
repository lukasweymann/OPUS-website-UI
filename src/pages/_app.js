import { Roboto_Mono } from 'next/font/google'


export const metadata = {
  title: "OPUS",
  description: "The biggest free corpora collection ever.",
  metadataBase: new URL("https://opusdemo.prompsit.com"),
  openGraph: {
    images: "/opengraph-image.png",
  },
};

export default function App({ Component, pageProps }) {
  return (
    <Component {...pageProps} suppressHydrationWarning />
  );
}
