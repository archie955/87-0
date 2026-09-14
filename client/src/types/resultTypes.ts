export type Cat =
  "cat_1" | "cat_2" | "cat_3" | "cat_4" | "cat_5" | "cat_6" | "cat_7";

export interface Result {
  score: number;
  cat: Cat;
  best: boolean;
}
