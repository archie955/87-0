type Cat = "cat_1" | "cat_2" | "cat_3" | "cat_4" | "cat_5" | "cat_6";

export interface Result {
  score: number;
  cat: Cat;
  best: boolean;
}
