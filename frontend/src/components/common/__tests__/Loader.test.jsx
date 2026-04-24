import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Loader from "./Loader";

describe("Loader", () => {

  it("affiche le texte de chargement", () => {
    render(<Loader />);
    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  it("a un id et une classe", () => {
    render(<Loader />);
    const loader = screen.getByText("Chargement...");
    expect(loader).toHaveAttribute("id", "loader-spinner");
    expect(loader).toHaveClass("loader");
  });

});