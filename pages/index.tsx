import { useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@heroui/input";

import DefaultLayout from "@/layouts/default";
import { fontDisplay } from "@/config/fonts";

type LandShapeType =
  | "Square"
  | "Star"
  | "Triangle"
  | "Trapezium"
  | "Circle"
  | "Diamond"
  | "Hexagon"
  | "Pentagon"
  | "Flower"
  | "Cross";

type Land = {
  id: string;
  shape: LandShapeType;
  x: number; // px in map image coordinates
  y: number; // px in map image coordinates
};

function normalizePassword(value: string) {
  return value.trim();
}

function ShapeIcon({ shape }: { shape: LandShapeType }) {
  const common = {
    className: "h-15 w-15",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  } as const;

  switch (shape) {
    case "Square":
      return (
        <svg {...common}>
          <rect
            x="5"
            y="5"
            width="14"
            height="14"
            rx="2"
            className="fill-current text-white stroke-current"
            strokeWidth="4"
          />
        </svg>
      );
    case "Star":
      return (
        <svg {...common}>
          <path
            d="M12 3.2l2.35 5.06 5.55.53-4.18 3.62 1.25 5.37L12 15.9 7.03 17.8l1.25-5.37L4.1 8.8l5.55-.53L12 3.2z"
            className="fill-current text-white stroke-current"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Triangle":
      return (
        <svg {...common}>
          <path
            d="M12 5l8 14H4L12 5z"
            className="fill-current text-white stroke-current"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Trapezium":
      return (
        <svg {...common}>
          <path
            d="M7 7h10l3 12H4L7 7z"
            className="fill-current text-white stroke-current"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Circle":
      return (
        <svg {...common}>
          <circle
            cx="12"
            cy="12"
            r="7"
            className="fill-current text-white stroke-current"
            strokeWidth="4"
          />
        </svg>
      );
    case "Diamond":
      return (
        <svg {...common}>
          <path
            d="M12 4l7 8-7 8-7-8 7-8z"
            className="fill-current text-white stroke-current"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Hexagon":
      return (
        <svg {...common}>
          <path
            d="M8 4h8l4 8-4 8H8l-4-8 4-8z"
            className="fill-current text-white stroke-current"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Cross":
      return (
        <svg {...common}>
          <path
            d="M6 6l12 12M18 6l-12 12"
            className="stroke-current text-white"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      );
    case "Pentagon":
      return (
        <svg {...common}>
          <path
            d="M12 4l7 5-2.7 10H7.7L5 9l7-5z"
            className="fill-current text-white stroke-current"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Flower": {
      const petalCount = 14;
      const ringRadius = 7;
      const petalRadius = 0.75;
      const petals = Array.from({ length: petalCount }, (_, i) => {
        const angle = (i * 2 * Math.PI) / petalCount;
        return {
          cx: 12 + Math.cos(angle) * ringRadius,
          cy: 12 + Math.sin(angle) * ringRadius,
        };
      });

      return (
        <svg {...common}>
          <g
            className="fill-current text-black stroke-current"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="5.4" />
            {petals.map((petal, index) => (
              <circle key={index} cx={petal.cx} cy={petal.cy} r={petalRadius} />
            ))}
          </g>
        </svg>
      );
    }
    default:
      return null;
  }
}

export default function IndexPage() {
  const MAP_W = 2752;
  const MAP_H = 1536;
  const crossFocus = { x: 2020, y: 370 };
  const zoomScale = 1.5;

  const lands: Land[] = useMemo(
    () => [
      // Tuned to the actual PNG size: 2752 x 1536
      // These points align to the black reference dots on the map image.
      { id: "cross", shape: "Cross", x: 2020, y: 370 },
      { id: "diamond", shape: "Diamond", x: 1780, y: 680 },
      { id: "circle", shape: "Circle", x: 1580, y: 920 },
      { id: "triangle", shape: "Triangle", x: 1300, y: 990 },
      { id: "star", shape: "Star", x: 1000, y: 1000 },
      { id: "square", shape: "Square", x: 750, y: 1060 },
    ],
    [],
  );

  const routeD = useMemo(() => {
    const points = [...lands].sort((a, b) => a.y - b.y);
    if (points.length < 2) return "";

    const d: string[] = [];

    // Catmull-Rom -> cubic Bezier for a smooth "backbone" route.
    const alpha = 1;
    const tension = 0.6;
    const get = (i: number) =>
      points[Math.max(0, Math.min(points.length - 1, i))];

    d.push(`M ${points[0].x} ${points[0].y}`);

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = get(i - 1);
      const p1 = get(i);
      const p2 = get(i + 1);
      const p3 = get(i + 2);

      const c1x = p1.x + ((p2.x - p0.x) * tension) / (6 * alpha);
      const c1y = p1.y + ((p2.y - p0.y) * tension) / (6 * alpha);
      const c2x = p2.x - ((p3.x - p1.x) * tension) / (6 * alpha);
      const c2y = p2.y - ((p3.y - p1.y) * tension) / (6 * alpha);

      d.push(`C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`);
    }

    return d.join(" ");
  }, [lands]);

  const [password, setPassword] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clue, setClue] = useState("");
  const [clue2, setClue2] = useState("");
  const [clue3, setClue3] = useState("");
  const [imageClue, setImageClue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [zoomStage, setZoomStage] = useState<"idle" | "in" | "out">("idle");
  const [showClue, setShowClue] = useState(false);
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isClueVisible = unlocked && showClue;

  useEffect(() => {
    return () => {
      if (unlockTimerRef.current) {
        clearTimeout(unlockTimerRef.current);
      }
      if (zoomTimerRef.current) {
        clearTimeout(zoomTimerRef.current);
      }
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  async function onSubmit() {
    if (isLoading) return;
    const normalized = normalizePassword(password);

    try {
      setIsLoading(true);
      setPassword("");
      const response = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: normalized }),
      });

      if (!response.ok) {
        setError("Wrong code. Try again.");
        setAttempt((n) => n + 1);
        return;
      }

      const data = (await response.json()) as {
        clue?: string;
        clue2?: string;
        clue3?: string;
        imageClue?: string;
      };

      setUnlocked(true);
      setError(null);
      setClue(data.clue ?? "");
      setClue2(data.clue2 ?? "");
      setClue3(data.clue3 ?? "");
      setImageClue(data.imageClue ?? "");
      setShowClue(false);
      setZoomStage("in");

      if (zoomTimerRef.current) {
        clearTimeout(zoomTimerRef.current);
      }

      zoomTimerRef.current = setTimeout(() => {
        setShowClue(true);
      }, 1200);

      if (unlockTimerRef.current) {
        clearTimeout(unlockTimerRef.current);
      }

      unlockTimerRef.current = setTimeout(() => {
        setShowClue(false);
        setZoomStage("out");

        if (resetTimerRef.current) {
          clearTimeout(resetTimerRef.current);
        }

        resetTimerRef.current = setTimeout(() => {
          setZoomStage("idle");
          setUnlocked(false);
          setPassword("");
          setError(null);
          setAttempt(0);
          setClue("");
          setClue2("");
          setClue3("");
          setImageClue("");
          window.location.reload();
        }, 1200);
      }, 15000);
    } catch (err) {
      setError("Unable to verify code. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <DefaultLayout>
      <section className="relative w-screen h-screen overflow-hidden bg-default-50 text-black">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 h-full w-full ls-map-stage"
            style={{
              transformOrigin: "50% 50%",
              transform:
                zoomStage === "in" ? `scale(${zoomScale})` : "scale(1)",
            }}
          >
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox={`0 0 ${MAP_W} ${MAP_H}`}
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <image
                href="/map-japan-3d.png"
                xlinkHref="/map-japan-3d.png"
                width={MAP_W}
                height={MAP_H}
                preserveAspectRatio="xMidYMid slice"
                style={{ pointerEvents: "none" }}
              />

              <g className="ls-route" style={{ pointerEvents: "none" }}>
                <path
                  d={routeD}
                  fill="none"
                  className=""
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeDasharray="16 26"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d={routeD}
                  fill="none"
                  className="stroke-black"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray="16 26"
                  vectorEffect="non-scaling-stroke"
                />
              </g>

              {lands.map((land, idx) => {
                const floatClass = `ls-float-${(idx % 3) + 1}`;
                const markerSize = 96;
                const cardSize = 64;
                const dotAnchorY = cardSize - 2;

                return (
                  <foreignObject
                    key={land.id}
                    x={land.x - markerSize / 2}
                    y={land.y - dotAnchorY}
                    width={markerSize}
                    height={markerSize}
                    overflow="visible"
                  >
                    <div className="relative h-full w-full">
                      <button
                        type="button"
                        className={
                          "absolute left-1/2 top-0 -translate-x-1/2 group outline-none " +
                          floatClass +
                          " transition-transform duration-200 hover:scale-[1.03]"
                        }
                      >
                        <div className="relative grid place-items-center">
                          <ShapeIcon shape={land.shape} />
                          <span
                            className={
                              "absolute -bottom-2 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full " +
                              "bg-black"
                            }
                            aria-hidden="true"
                          />
                        </div>
                      </button>
                    </div>
                  </foreignObject>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="absolute inset-x-0 left-20 top-45 z-20 flex justify-left px-4 pointer-events-none">
          <div className="w-full max-w-5xl pointer-events-auto">
            <div className="text-center">
              <h1
                className={" text-[120px] text-black " + fontDisplay.className}
              >
                The Lost Scroll
              </h1>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-25 z-20 flex justify-center px-4 pointer-events-none">
          <div className="w-full max-w-2xl pointer-events-auto">
            <div className="flex flex-col items-stretch gap-2">
              <div className={error ? "ls-shake" : undefined} key={attempt}>
                <Input
                  aria-label="Password"
                  classNames={{
                    input:
                      "text-black !text-black placeholder:text-black bold text-[20px] caret-black justify-center text-center",
                    inputWrapper:
                      "justify-center text-center bg-transparent border-black/60 data-[hover=true]:bg-transparent data-[hover=true]:border-black group-data-[focus=true]:bg-transparent group-data-[focus=true]:border-black after:bg-black",
                    errorMessage: "text-black justify-center text-center",
                  }}
                  errorMessage={error ?? undefined}
                  isInvalid={Boolean(error)}
                  isDisabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSubmit();
                  }}
                  onValueChange={setPassword}
                  placeholder={unlocked ? "" : "Input Code Here"}
                  type="text"
                  value={password}
                  variant="underlined"
                />
              </div>
              {isLoading ? (
                <div className="text-center text-[14px] text-black/70 animate-pulse">
                  Checking code...
                </div>
              ) : unlocked ? (
                <div className="h-[20px]" aria-hidden="true" />
              ) : (
                <div className="text-center text-[14px] text-black/70">
                  Press Enter to submit
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute inset-0 z-20 flex items-center justify-center px-6 pointer-events-none">
          <div
            className={
              "absolute inset-0 transition-opacity duration-700 ease-in-out " +
              (isClueVisible || zoomStage === "in"
                ? "opacity-100"
                : "opacity-0")
            }
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-2xl" />
          </div>
          <div
            className={
              "text-center justify-center text-black w-full max-w-4xl max-h-[90vh] flex flex-col items-center gap-6 " +
              (isClueVisible
                ? "ls-clue-pop"
                : zoomStage === "out"
                  ? "ls-clue-fade"
                  : "opacity-0 pointer-events-none")
            }
            aria-hidden={!isClueVisible}
          >
            {imageClue ? (
              <div className="block w-full justify-center">
                <div className="text-[clamp(16px,2.2vw,30px)] text-red-800 whitespace-pre-line leading-snug max-w-4xl mb-4">
                  Final Clue: Carilah tempat yang sesuai dengan gambar di bawah
                  ini.
                </div>
                <img
                  src={imageClue}
                  alt="Clue"
                  className="max-h-[75vh] w-full max-w-6xl rounded-2xl object-contain"
                />
              </div>
            ) : null}
            <div className="text-[clamp(16px,2.2vw,24px)] text-white whitespace-pre-line leading-snug max-w-4xl">
              {clue}
            </div>
            <div className="text-[clamp(16px,2.2vw,24px)] text-white whitespace-pre-line leading-snug max-w-4xl">
              {clue2}
            </div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
