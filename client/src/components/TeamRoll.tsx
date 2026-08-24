import { faker } from "@faker-js/faker";

import { Carousel } from "@/components/ui/carousel";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TeamRollProps = {
  slides: number[];
  winnerIndex: number;
};

const TeamRoll = ({ slides, winnerIndex }: TeamRollProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
    },
    [
      AutoScroll({
        speed: 20,
        startDelay: 0.5,
      }),
    ],
  );

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {slides.map((teamId, index) => (
          <div key={index} className="min-w-0 shrink-0 grow-0 basis-full">
            <div className="flex aspect-video items-center justify-center">
              {teamId}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamRoll;
