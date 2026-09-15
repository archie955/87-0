import { describe, it, expect } from "vitest";
import { render, screen } from "../test-utils";
import CatchAll from "@/pages/CatchAll";

describe("CatchAll", () => {
  it("shows the 404 dialog", () => {
    render(<CatchAll />);
    expect(screen.getByText(/404 - Page not found/i)).toBeInTheDocument();
  });
});
