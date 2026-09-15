import { describe, it, expect } from "vitest";
import { render, screen } from "../test-utils";
import Loading from "@/components/Loading";

describe("Loading", () => {
  it("renders the loading copy", () => {
    render(<Loading />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByText("please wait")).toBeInTheDocument();
  });
});
