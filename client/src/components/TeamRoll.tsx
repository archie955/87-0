import type { Team } from "@/types/teamTypes";
import { useEffect, useRef, useState } from "react";

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
  }, []);

  return (
    <div className="w-[600px] overflow-hidden">
      <div
        className="flex"
        style={{
          transform: `translateX(-${position}px)`,
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={`${index}-${index}`}
            className="flex h-32 shrink-0 items-center justify-center border"
            style={{ width: SLIDE_WIDTH }}
          >
            {slide.name} {index}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamRoll;
