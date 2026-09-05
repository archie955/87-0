import type { Team } from "@/types/teamTypes";
import { useEffect, useRef, useState } from "react";
import { cn, teamToImg } from "@/lib/utils";

const SLIDE_WIDTH = 120;
const START_SPEED = 7000;

type TeamRollProps = {
  slides: Team[];
  winnerIndex: number;
  onComplete: () => void;
};

const TeamRoll = ({ slides, winnerIndex, onComplete }: TeamRollProps) => {
  const [position, setPosition] = useState(0);

  const positionRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const targetPosition = SLIDE_WIDTH * (winnerIndex - 2);

  useEffect(() => {
    let previousTime: number | null = null;

    const animate = (time: number) => {
      if (positionRef.current >= targetPosition) {
        positionRef.current = targetPosition;
        setPosition(targetPosition);

        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }

        return;
      }

      if (previousTime === null) {
        previousTime = time;
      }

      const deltaTime = (time - previousTime) / 1000;
      previousTime = time;

      const currentSlide = positionRef.current / SLIDE_WIDTH;

      const remainingDistance = winnerIndex - 1 - currentSlide;

      const speed =
        (START_SPEED * Math.sqrt(Math.max(remainingDistance, 0))) /
        (winnerIndex - 2);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-px -translate-x-1/2 bg-primary" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <div
        className="flex"
        style={{
          transform: `translateX(-${position}px)`,
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={`${index}-${index}`}
            className={cn(
              "flex h-32 shrink-0 items-center justify-center border-x border-border bg-card px-4",
              index === winnerIndex && "bg-primary/5",
            )}
            style={{ width: SLIDE_WIDTH, backgroundColor: "gray" }}
          >
            <img
              src={teamToImg(slide.name)}
              alt={slide.name}
              className="max-h-24 w-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamRoll;
