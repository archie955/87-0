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
    <div className="mx-auto max-w-sm">
      <label
        htmlFor="rules"
        className="text-heading mb-2.5 block text-sm font-medium"
      >
        Select a ruleset
      </label>
      <select
        id="rules"
        value={rules}
        onChange={handleChange}
        className="border-default-medium text-heading rounded-base focus:ring-brand focus:border-brand placeholder:text-body block w-full border px-3 py-2.5 text-sm shadow-xs"
      >
        <option className="bg-secondary" value="easy">
          Easy - show player ratings
        </option>
        <option className="bg-secondary" value="hard">
          Hard - hide player ratings
        </option>
      </select>
    </div>
  );
};

export default RuleChange;
