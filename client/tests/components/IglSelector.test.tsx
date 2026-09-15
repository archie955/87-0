import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "../test-utils";
import IglSelector from "@/components/IglSelector";
import { Roles, lineupRoles } from "@/services/enum";
import { useRuleStore } from "@/stores/ruleStore";
import { makePlayerOfRole } from "../helpers/factories";

beforeEach(() => {
  useRuleStore.setState({ rules: "easy" });
});

const s1mple = makePlayerOfRole(Roles.AWPER, {
  name: "s1mple",
  igl_score: 1.5,
  hltv: 1.2,
});
const donk = makePlayerOfRole(Roles.OPENER, {
  name: "donk",
  igl_score: 1.0,
  hltv: 1.4,
});

const candidates = [
  { role: lineupRoles.awper, player: s1mple },
  { role: lineupRoles.opener, player: donk },
];

describe("IglSelector", () => {
  it("renders nothing when there are no candidates", () => {
    const { container } = render(
      <IglSelector candidates={[]} selected={null} onSelect={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders a card per candidate", () => {
    render(
      <IglSelector
        candidates={candidates}
        selected={null}
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText("s1mple")).toBeInTheDocument();
    expect(screen.getByText("donk")).toBeInTheDocument();
  });

  it("shows the IGL bonus (igl_score - hltv) in the easy ruleset", () => {
    render(
      <IglSelector
        candidates={candidates}
        selected={null}
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText("0.30")).toBeInTheDocument();
    expect(screen.getByText("-0.40")).toBeInTheDocument();
  });

  it("hides the IGL bonus in the hard ruleset", () => {
    useRuleStore.setState({ rules: "hard" });

    render(
      <IglSelector
        candidates={candidates}
        selected={null}
        onSelect={() => {}}
      />,
    );

    expect(screen.queryByText("0.30")).not.toBeInTheDocument();
    expect(screen.queryByText("-0.40")).not.toBeInTheDocument();
  });

  it("calls onSelect with the candidate's role when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <IglSelector
        candidates={candidates}
        selected={null}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByText("s1mple"));
    expect(onSelect).toHaveBeenCalledWith(lineupRoles.awper);
  });

  it("shows the IGL badge on the selected candidate", () => {
    render(
      <IglSelector
        candidates={candidates}
        selected={lineupRoles.awper}
        onSelect={() => {}}
      />,
    );

    const badges = screen.getAllByText(/^IGL$/i);
    expect(badges).toHaveLength(1);
  });
});
