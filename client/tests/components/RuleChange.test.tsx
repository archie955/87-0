import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import RuleChange from "@/components/RuleChange";
import PlayerCard from "@/components/PlayerCard";
import { Roles } from "@/services/enum";
import type { Player } from "@/types/playerTypes";

const player: Player = {
  id: 1,
  team_id: 1,
  name: "s1mple",
  role: Roles.AWPER,
  hltv: 1.34,
  igl_score: 0.1,
};

describe("RuleChange", () => {
  it("defaults to the easy ruleset", () => {
    render(<RuleChange />);
    expect(screen.getByLabelText("Select a ruleset")).toHaveValue("easy");
  });

  it("REGRESSION: choosing 'Hard' actually updates the store and is reflected elsewhere", async () => {
    const user = userEvent.setup();
    render(
      <>
        <RuleChange />
        <PlayerCard player={player} selectable onSelect={() => {}} />
      </>,
    );

    expect(screen.getByText("1.34")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Select a ruleset"), "hard");

    expect(screen.getByLabelText("Select a ruleset")).toHaveValue("hard");
    expect(screen.queryByText("1.34")).not.toBeInTheDocument();
  });
});
