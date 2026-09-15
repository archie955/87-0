import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "../test-utils";
import PlayerCard from "@/components/PlayerCard";
import { useRuleStore } from "@/stores/ruleStore";
import { Roles } from "@/services/enum";
import { makePlayer } from "../helpers/factories";

beforeEach(() => {
  useRuleStore.setState({ rules: "easy" });
});

describe("PlayerCard", () => {
  it("shows HLTV and the role badge in the easy ruleset", () => {
    render(
      <PlayerCard
        player={makePlayer({ name: "donk", role: Roles.OPENER, hltv: 1.4 })}
        selectable
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText("donk")).toBeInTheDocument();
    expect(screen.getByText("1.40")).toBeInTheDocument();
    expect(screen.getByText("OPENER")).toBeInTheDocument();
  });

  it("swaps HLTV for the role label in the hard ruleset", () => {
    useRuleStore.setState({ rules: "hard" });

    render(
      <PlayerCard
        player={makePlayer({ name: "donk", role: Roles.OPENER, hltv: 1.4 })}
        selectable
        onSelect={() => {}}
      />,
    );

    expect(screen.queryByText("1.40")).not.toBeInTheDocument();
    expect(screen.getByText("Opener")).toBeInTheDocument();
  });

  it("calls onSelect when the card is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<PlayerCard player={makePlayer()} selectable onSelect={onSelect} />);

    await user.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("disables the button and ignores clicks when not selectable", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <PlayerCard
        player={makePlayer()}
        selectable={false}
        onSelect={onSelect}
      />,
    );

    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();

    await user.click(btn);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
