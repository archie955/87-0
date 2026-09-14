import type { Cat } from "@/types/resultTypes";

const CAT_1 =
  "This might be it: The GOAT team. If any team had a chance \
of beating NIP's 87-0 record it's probably this team. Multiple majors, \
an era superior to Astralis or Vitality, the sky is the limit";

const CAT_2 =
  "It's not a question of if you'll win a major, but how many? \
This is a dynasty à la Vitality and Astralis. One of the GOAT teams, but not \
standing alone";

const CAT_3 =
  "Winning is expected, and being hopeful for a major is certainly \
justifiable. Improvements must happen if you are to form a dynasty, but a career \
in a team like this will guarantee trophies";

const CAT_4 =
  "You'd hope this team will win something, even if a lesser \
tournament, but I wouldn't get used to lifting trophies. Reaching the knockouts \
of majors is the expectation";

const CAT_5 =
  "Okay, you might not win anything but a good run here and there \
could land you in the knockout stages for something";

const CAT_6 =
  "Unambiguously a tier 2 team, but maybe you have some rookies \
or some pros clinging on to past successes that could be moved on giving \
some hope for a push to tier 1";

const CAT_7 =
  "Maybe just try again... Don't forget to put it on 'easy' \
using the toggle above";

export const catToDescription = (cat: Cat): string => {
  switch (cat) {
    case "cat_1":
      return CAT_1;
    case "cat_2":
      return CAT_2;
    case "cat_3":
      return CAT_3;
    case "cat_4":
      return CAT_4;
    case "cat_5":
      return CAT_5;
    case "cat_6":
      return CAT_6;
    default:
      return CAT_7;
  }
};
