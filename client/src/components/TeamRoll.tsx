import type { Team } from "@/types/teamTypes";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Crosshair } from "lucide-react";

const SLIDE_WIDTH = 156;
const MAX_SPEED = 1950;
const BRAKE_DISTANCE = 2200;
const MIN_SPEED = 75;

type TeamRollProps = {
  slides: Team[];
  winnerIndex: number;
  onComplete: () => void;
};

const TeamRoll = ({ slides, winnerIndex, onComplete }: TeamRollProps) => {
  const [position, setPosition] = useState(0);
  const [settled, setSettled] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const positionRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    let previousTime: number | null = null;
    completedRef.current = false;
    setSettled(false);

    const containerWidth = container.clientWidth;

    const targetPosition =
      winnerIndex * SLIDE_WIDTH + SLIDE_WIDTH / 2 - containerWidth / 2;

    positionRef.current = 0;
    setPosition(0);

    const getSpeed = (remaining: number) => {
      if (remaining >= BRAKE_DISTANCE) {
        return MAX_SPEED;
      }

      const progress = Math.max(0, Math.min(1, remaining / BRAKE_DISTANCE));
      const eased = progress * (3 - 2 * progress);
      return Math.max(MIN_SPEED, MAX_SPEED * eased);
    };

    const animate = (time: number) => {
      if (previousTime === null) {
        previousTime = time;
      }

      const deltaTime = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;

      const remaining = targetPosition - positionRef.current;

      if (remaining <= 0.75) {
        positionRef.current = targetPosition;
        setPosition(targetPosition);
        setSettled(true);

        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }

        return;
      }

      positionRef.current += getSpeed(remaining) * deltaTime;

      if (positionRef.current > targetPosition) {
        positionRef.current = targetPosition;
      }

      setPosition(positionRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [onComplete, winnerIndex]);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="from-card via-card/90 absolute inset-y-0 left-0 w-24 bg-gradient-to-r to-transparent" />
        <div className="from-card via-card/90 absolute inset-y-0 right-0 w-24 bg-gradient-to-l to-transparent" />
      </div>

      <div className="from-card pointer-events-none absolute inset-x-0 top-0 z-30 h-12 bg-gradient-to-b to-transparent" />
      <div className="from-card pointer-events-none absolute inset-x-0 bottom-0 z-30 h-12 bg-gradient-to-t to-transparent" />

      <div className="border-border/80 bg-background/40 relative mx-auto h-[220px] overflow-hidden rounded-2xl border shadow-[inset_0_0_60px_oklch(0_0_0_/_18%)]">
        <div className="bg-primary/80 pointer-events-none absolute inset-y-0 left-1/2 z-40 w-px -translate-x-1/2 shadow-[0_0_18px_oklch(0.78_0.16_80_/_45%)]" />

        <div className="pointer-events-none absolute top-0 left-1/2 z-40 -translate-x-1/2">
          <div className="text-primary flex -translate-y-1 items-center justify-center">
            <Crosshair className="fill-primary/10 size-8 drop-shadow-[0_0_12px_oklch(0.78_0.16_80_/_50%)]" />
          </div>
        </div>

        <div
          className={cn(
            "absolute top-1/2 left-1/2 z-40 -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-1 text-[9px] font-black tracking-[0.2em] uppercase transition-all",
            settled
              ? "border-primary/40 bg-primary/15 text-primary shadow-[0_0_20px_oklch(0.78_0.16_80_/_12%)]"
              : "border-border/70 bg-background/70 text-muted-foreground",
          )}
        >
          {settled ? "Locked" : "Rolling"}
        </div>

        <div
          className="flex h-full items-center will-change-transform"
          style={{
            width: slides.length * SLIDE_WIDTH,
            transform: `translate3d(-${position}px, 0, 0)`,
          }}
        >
          {slides.map((slide, index) => {
            const isWinner = index === winnerIndex;

            return (
              <div
                key={`${slide.id}-${index}`}
                className="flex h-full shrink-0 items-center justify-center px-2"
                style={{ width: SLIDE_WIDTH }}
              >
                <div
                  className={cn(
                    "relative flex h-36 w-full flex-col items-center justify-center overflow-hidden rounded-xl border text-center transition-all",
                    isWinner
                      ? "border-primary/30 bg-primary/10 shadow-[inset_0_1px_0_oklch(1_0_0_/_5%)]"
                      : "border-border/60 bg-card/70",
                  )}
                >
                  {isWinner && (
                    <div className="bg-primary/70 absolute inset-x-4 top-0 h-0.5" />
                  )}

                  <div className="border-border/60 bg-background/40 flex size-11 items-center justify-center rounded-xl border">
                    <span className="text-muted-foreground font-mono text-xs font-black">
                      {slide.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>

                  <p className="mt-3 max-w-[118px] truncate text-xs font-bold">
                    {slide.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeamRoll;
