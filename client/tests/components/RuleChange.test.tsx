import { describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "../test-utils";
import RuleChange from "@/components/RuleChange";
import PlayerCard from "@/components/PlayerCard";
import { Roles } from "@/services/enum";
import { useRuleStore } from "@/stores/ruleStore";
import { makePlayer } from "../helpers/factories";

beforeEach(() => {
  useRuleStore.setState({ rules: "easy" });
});

describe("RuleChange", () => {
  it("defaults to the easy ruleset", () => {
    render(<RuleChange />);

    expect(screen.getByLabelText("Select a ruleset")).toHaveValue("easy");
  });

  it("reflects the current ruleset from the store on mount", () => {
    useRuleStore.setState({ rules: "hard" });

    render(<RuleChange />);

    expect(screen.getByLabelText("Select a ruleset")).toHaveValue("hard");
  });

  it("updates the store when a new ruleset is chosen, both ways", async () => {
    const user = userEvent.setup();
    render(<RuleChange />);

    const select = screen.getByLabelText("Select a ruleset");

    await user.selectOptions(select, "hard");
    expect(useRuleStore.getState().rules).toBe("hard");

    await user.selectOptions(select, "easy");
    expect(useRuleStore.getState().rules).toBe("easy");
  });
});

describe("RuleChange integration", () => {
  it("switching to 'hard' hides HLTV scores in downstream consumers", async () => {
    const user = userEvent.setup();

    render(
      <>
        <RuleChange />
        <PlayerCard
          player={makePlayer({
            name: "s1mple",
            role: Roles.AWPER,
            hltv: 1.34,
          })}
          selectable
          onSelect={() => {}}
        />
      </>,
    );

    expect(screen.getByText("1.34")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Select a ruleset"), "hard");

    expect(screen.queryByText("1.34")).not.toBeInTheDocument();
  });
});
