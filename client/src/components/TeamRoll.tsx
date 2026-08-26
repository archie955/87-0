import { Team } from "@/types/teamTypes";
import { useEffect, useRef, useState } from "react";

const SLIDE_WIDTH = 120;
const START_SPEED = 1600;

type TeamRollProps = {
  slides: Team[];
  winnerIndex: number;
  onComplete: () => void;
};

const TeamRoll = ({ slides, winnerIndex, onComplete }: TeamRollProps) => {
  const [position, setPosition] = useState(0);

  const positionRef = useRef(0);
  const velocityRef = useRef(START_SPEED);
  const animationRef = useRef<number | null>(null);

  const targetPosition = SLIDE_WIDTH * (winnerIndex - 2);
  const setSpeedByPosition = (pos: number) => {
    return (START_SPEED * (winnerIndex - 1 - pos)) / (winnerIndex - 2);
  };

  useEffect(() => {
    let previousTime: number | null = null;

    const animate = (time: number) => {
      if (positionRef.current > targetPosition) {
        onComplete();
        return;
      }
      if (previousTime === null) {
        previousTime = time;
      }

      const deltaTime = (time - previousTime) / 1000;
      previousTime = time;

      velocityRef.current = setSpeedByPosition(
        positionRef.current / SLIDE_WIDTH,
      );

      positionRef.current += velocityRef.current * deltaTime;

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
            key={index}
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
