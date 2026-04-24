import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ErrorMessage from "./ErrorMessage";

describe("ErrorMessage", () => {

  it("affiche le message si présent", () => {
    render(<ErrorMessage message="Erreur !" />);
    expect(screen.getByText("Erreur !")).toBeInTheDocument();
  });

  it("ne rend rien si message vide", () => {
    const { container } = render(<ErrorMessage message="" />);
    expect(container.firstChild).toBeNull();
  });

  it("applique l'id", () => {
    render(<ErrorMessage message="Erreur" id="error-id" />);
    expect(screen.getByText("Erreur")).toHaveAttribute("id", "error-id");
  });

});