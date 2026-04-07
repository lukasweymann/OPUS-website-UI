import { Html, Head, Main, NextScript } from "next/document";

export const metadata = {
	title: "OPUS",
	description: "The biggest free corpora collection ever.",
	metadataBase: new URL("https://opusdemo.prompsit.com"),
	openGraph: {
		images: "/opengraph-image.png",
	},
};


export default function Document() {
	return (
		<Html lang="en" >
			<Head>
				<link rel="shortcut icon" href="/favicon.ico" />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
