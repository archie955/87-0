import { describe, it, expect } from "vitest";
import { render, screen } from "../test-utils";
import LineupProgress from "@/components/LineupProgress";

describe("LineupProgress", () => {
  it("shows the locked counter and draft heading", () => {
    render(
      <LineupProgress
        selections={["", "", "", "", ""]}
        current={0}
        pickNumber={0}
        reroll={null}
      />,
    );

    expect(screen.getByText(/draft progression/i)).toBeInTheDocument();
    expect(screen.getByText("0/5 locked")).toBeInTheDocument();
  });

  it("renders team names as the draft progresses", () => {
    render(
      <LineupProgress
        selections={["Falcons", "Vitality", "", "", ""]}
        current={2}
        pickNumber={2}
        reroll={null}
      />,
    );

    expect(screen.getByText("Falcons")).toBeInTheDocument();
    expect(screen.getByText("Vitality")).toBeInTheDocument();
    expect(screen.getByText("2/5 locked")).toBeInTheDocument();
  });

  it("renders without a rerolled team when none has been used", () => {
    render(
      <LineupProgress
        selections={["Falcons", "", "", "", ""]}
        current={1}
        pickNumber={1}
        reroll={null}
      />,
    );

    const named = screen.queryAllByText("Falcons");
    expect(named).toHaveLength(1);
  });
});
