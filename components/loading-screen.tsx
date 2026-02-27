import { useEffect, useState } from "react";

type LoadingScreenProps = {
  holdMs?: number;
};

export function LoadingScreen({ holdMs = 1000 }: LoadingScreenProps) {
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [src, setSrc] = useState("/loading-scroll.png");

  useEffect(() => {
    const ENTER_MS = 420;
    const EXIT_MS = 220;
    const hideAtMs = ENTER_MS + Math.max(0, holdMs);
    const finishAtMs = hideAtMs + EXIT_MS;

    setVisible(true);
    setHiding(false);

    const startHideTimer = window.setTimeout(() => {
      setHiding(true);
    }, hideAtMs);

    const finishTimer = window.setTimeout(() => {
      setVisible(false);
    }, finishAtMs);

    return () => {
      window.clearTimeout(startHideTimer);
      window.clearTimeout(finishTimer);
    };
  }, [holdMs]);

  if (!visible) return null;

  return (
    <div
      aria-label="Loading"
      className={
        "fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm transition-opacity duration-200 " +
        (hiding ? "opacity-0" : "opacity-100")
      }
      role="status"
    >
      <div className={"ls-loader-pop " + (hiding ? "ls-loader-exit" : "")}>
        <img
          alt="The Lost Scroll loading"
          className="h-auto w-[280px] select-none sm:w-[340px] md:w-[420px]"
          draggable={false}
          onError={() => setSrc("/loading-scroll-fallback.svg")}
          src={src}
        />
      </div>
    </div>
  );
}
