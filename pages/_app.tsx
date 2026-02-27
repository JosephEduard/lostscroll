import type { AppProps } from "next/app";

import { useEffect, useState } from "react";

import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";

import { fontSans, fontMono } from "@/config/fonts";
import { LoadingScreen } from "@/components/loading-screen";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const ENTER_MS = 420;
    const HOLD_MS = 1000;
    const EXIT_MS = 220;
    const TOTAL_MS = ENTER_MS + HOLD_MS + EXIT_MS;

    try {
      const key = "ls_seen_loader";
      const hasSeen = window.sessionStorage.getItem(key) === "1";

      if (!hasSeen) {
        setShowLoader(true);
        window.sessionStorage.setItem(key, "1");

        const t = window.setTimeout(() => setShowLoader(false), TOTAL_MS);

        return () => window.clearTimeout(t);
      }
    } catch {
      setShowLoader(true);
      const t = window.setTimeout(() => setShowLoader(false), TOTAL_MS);

      return () => window.clearTimeout(t);
    }
  }, []);

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider attribute="class" defaultTheme="light">
        {showLoader ? <LoadingScreen holdMs={1000} /> : null}
        <Component {...pageProps} />
      </NextThemesProvider>
    </HeroUIProvider>
  );
}

export const fonts = {
  sans: fontSans.style.fontFamily,
  mono: fontMono.style.fontFamily,
};
