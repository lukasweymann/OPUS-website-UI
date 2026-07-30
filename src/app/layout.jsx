import "./globals.css";
import Script from "next/script";
import { Roboto_Mono } from "next/font/google";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ToastProvider from "./components/ui/Toast/ToastProvider";

const robotoMono = Roboto_Mono({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: "OPUS - Corpora",
    template: "The biggest corpora collection on the web",
  },
  description:
    "OPUS is a growing collection of translated texts from the web. In the OPUS project we try to convert and align free online data, to add linguistic annotation, and to provide the community with a publicly available parallel corpus.",
  metadataBase: new URL("https://opus.nlpl.eu"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "OPUS - Corpora",
    description:
      "OPUS is a growing collection of translated texts from the web. In the OPUS project we try to convert and align free online data, to add linguistic annotation, and to provide the community with a publicly available parallel corpus.",
    url: "https://opus.nlpl.eu",
    siteName: "OPUS",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={robotoMono.className}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var stored = localStorage.getItem("theme");
                var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

                var theme =
                  stored === "light" || stored === "dark"
                    ? stored
                    : (stored === "system" || stored === null)
                      ? (prefersDark ? "dark" : "light")
                      : (prefersDark ? "dark" : "light");

                document.documentElement.dataset.theme = theme;
                document.documentElement.style.colorScheme = theme;
              } catch (e) {}
            })();
          `}
        </Script>

        <Navbar />
        {children}
        <ToastProvider />
        <Footer />
      </body>
    </html>
  );
}
