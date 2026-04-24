import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Footer from "./Footer";

describe("Footer", () => {

  it("affiche le texte du footer", () => {
    render(<Footer />);

    expect(
      screen.getByText("© 2026 E-Commerce. Tous droits réservés.")
    ).toBeInTheDocument();
  });

  it("rend un élément footer", () => {
    render(<Footer />);

    const footerElement = screen.getByRole("contentinfo");
    expect(footerElement).toBeInTheDocument();
  });

});