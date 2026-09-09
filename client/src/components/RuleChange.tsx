import { useRules, useRuleActions, type Rules } from "@/stores/ruleStore";
import { type ChangeEventHandler } from "react";

// can type things by stating it checks x is of type rather than just boolean
const isRules = (value: string): value is Rules =>
  value === "easy" || value === "hard";

const RuleChange = () => {
  const rules = useRules();
  const { setRules } = useRuleActions();

  // type the event handler before arg otherwise it raises issue
  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event): void => {
    if (isRules(event.target.value)) {
      setRules(event.target.value);
    }
  };

  return (
    <div className="max-w-sm mx-auto">
      <label
        htmlFor="rules"
        className="block mb-2.5 text-sm font-medium text-heading"
      >
        Select a ruleset
      </label>
      <select
        id="rules"
        value={rules}
        onChange={handleChange}
        className="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body"
      >
        <option value="easy">Easy - show player ratings</option>
        <option value="hard">Hard - hide player ratings</option>
      </select>
    </div>
  );
};

export default RuleChange;
