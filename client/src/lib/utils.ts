import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import nineZ from "@/assets/9z.webp";
import aurora from "@/assets/Aurora.webp";
import betboom from "@/assets/BetBoom.webp";
import falcons from "@/assets/Falcons.webp";
import furia from "@/assets/FURIA.webp";
import g2 from "@/assets/G2.webp";
import mouz from "@/assets/MOUZ.webp";
import navi from "@/assets/Natus Vincere.webp";
import spirit from "@/assets/Spirit.webp";
import vitality from "@/assets/Vitality.webp";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const teamToImg = (name: string) => {
  switch (name) {
    case "Falcons":
      return falcons;
    case "Vitality":
      return vitality;
    case "Spirit":
      return spirit;
    case "Natus Vincere":
      return navi;
    case "MOUZ":
      return mouz;
    case "G2":
      return g2;
    case "FURIA":
      return furia;
    case "9z":
      return nineZ;
    case "BetBoom":
      return betboom;
    case "Aurora":
      return aurora;
    default:
      return vitality;
  }
};
