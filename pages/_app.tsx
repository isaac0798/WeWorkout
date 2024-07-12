import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import "@/styles/globals.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			disableTransitionOnChange
		>
			<Component {...pageProps} />
		</ThemeProvider>
	);
}
