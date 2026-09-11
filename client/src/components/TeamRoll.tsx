import type { Team } from "@/types/teamTypes";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SLIDE_WIDTH = 120;
const MAX_SPEED = 1600;
const BRAKE_DISTANCE = 1800;

type TeamRollProps = {
  slides: Team[];
  winnerIndex: number;
  onComplete: () => void;
};

const TeamRoll = ({ slides, winnerIndex, onComplete }: TeamRollProps) => {
  const [position, setPosition] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const positionRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let previousTime: number | null = null;

    const containerWidth = container.clientWidth;

    const targetPosition =
      winnerIndex * SLIDE_WIDTH + SLIDE_WIDTH / 2 - containerWidth / 2;

    positionRef.current = 0;
    setPosition(0);

    const getSpeed = (remainingDistance: number) => {
      if (remainingDistance >= BRAKE_DISTANCE) {
        return MAX_SPEED;
      }

      const progress = Math.max(0, (remainingDistance + 60) / BRAKE_DISTANCE);

      return MAX_SPEED * progress;
    };

    const animate = (time: number) => {
      if (previousTime === null) {
        previousTime = time;
      }

      const deltaTime = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;

      const remainingDistance = targetPosition - positionRef.current;

      if (remainingDistance <= 0.5) {
        positionRef.current = targetPosition;
        setPosition(targetPosition);

        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }

        return;
      }

      const speed = getSpeed(remainingDistance);

      positionRef.current += speed * deltaTime;

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
      {/* Centre marker */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-px -translate-x-1/2 bg-primary" />

      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />

      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      <div
        className="flex"
        style={{
          transform: `translateX(-${position}px)`,
          willChange: "transform",
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className={cn(
              "flex h-32 shrink-0 items-center justify-center border-x border-border bg-card px-4",
            )}
            style={{ width: SLIDE_WIDTH }}
          >
            {slide.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamRoll;
