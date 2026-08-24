import { faker } from "@faker-js/faker";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import AutoScroll from "embla-carousel-auto-scroll";

export const title = "Standard Carousel";

const slides = Array.from({ length: 80 }, (_, index) => ({
  id: index + 1,
  image: faker.image.urlPicsumPhotos({ width: 800, height: 400 }),
}));

const Example = () => {
  return (
    <div className="mx-auto w-full max-w-xl">
      <Carousel
        opts={{
          align: "start",
        }}
        plugins={[AutoScroll()]}
        className="w-full max-w-[12rem] sm:max-w-xs md:max-w-sm"
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="flex aspect-video w-full items-center justify-center rounded-md border bg-background">
                <span className="text-4xl font-semibold">{slide.id}</span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default Example;
