import { useState, ChangeEventHandler } from "react";

type FieldInputType = "text" | "password" | "email" | "number";

interface UseFieldReturn {
  type: FieldInputType;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

const useField = (type: FieldInputType): UseFieldReturn => {
  const [value, setValue] = useState<string>("");

  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue(event.target.value);
  };

  return {
    type,
    value,
    onChange,
  };
};

export default useField;
