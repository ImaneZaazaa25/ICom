import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Button from "./Button";

describe("Button", () => {

  it("affiche le contenu (children)", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("appelle onClick quand on clique", () => {
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText("Click"));

    expect(handleClick).toHaveBeenCalled();
  });

  it("est désactivé si disabled=true", () => {
    render(<Button disabled>Test</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applique les classes CSS", () => {
    render(<Button className="custom">Test</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn");
    expect(screen.getByRole("button")).toHaveClass("custom");
  });

  it("applique le type", () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

});