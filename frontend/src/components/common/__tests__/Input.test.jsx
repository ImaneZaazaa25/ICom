import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Input from "../Input";

describe("Input", () => {

  it("affiche le label", () => {
    render(<Input label="Nom" id="name" value="" />);
    expect(screen.getByText("Nom")).toBeInTheDocument();
  });

  it("associe label et input", () => {
    render(<Input label="Email" id="email" value="" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("appelle onChange", () => {
    const handleChange = vi.fn();

    render(
      <Input
        value=""
        onChange={handleChange}
        id="test"
      />
    );

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "abc" },
    });

    expect(handleChange).toHaveBeenCalled();
  });

  it("affiche la valeur", () => {
    render(<Input value="test value" id="test" />);
    expect(screen.getByDisplayValue("test value")).toBeInTheDocument();
  });

  it("applique placeholder", () => {
    render(<Input placeholder="Entrer..." value="" />);
    expect(screen.getByPlaceholderText("Entrer...")).toBeInTheDocument();
  });

});