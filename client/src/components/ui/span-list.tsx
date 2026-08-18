import { ReactNode } from "react";

interface SpanProps {
  children: ReactNode;
}

const SpanList = ({ children }: SpanProps) => {
  return (
    <span style={{ display: "list-item", marginLeft: "2em" }}>{children}</span>
  );
};

export default SpanList;
