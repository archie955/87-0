import { useRuleActions } from "@/stores/ruleStore";

const RuleChange = () => {
  const { setEasy, setHard } = useRuleActions();

  return (
    <div className="max-w-sm mx-auto">
      <label className="block mb-2.5 text-sm font-medium text-heading">
        Select a ruleset
      </label>
      <select
        id="rules"
        className="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body"
      >
        <option selected value="easy" onSelect={setEasy}>
          Easy
        </option>
        <option selected value="hard" onSelect={setHard}>
          Hard
        </option>
      </select>
    </div>
  );
};

export default RuleChange;
