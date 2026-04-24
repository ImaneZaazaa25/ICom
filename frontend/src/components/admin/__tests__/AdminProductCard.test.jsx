import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminProductCard from "./AdminProductCard";
import { BrowserRouter } from "react-router-dom";

// Mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock ImageCarousel
vi.mock("../product/ImageCarousel", () => ({
  default: ({ images }) => <div data-testid="carousel">{images.length} images</div>,
}));

const productMock = {
  id: 1,
  nom: "Produit Test",
  description: "Description produit test",
  prix: 100,
  quantite: 5,
  statut: true,
  categorie: { id: 1, nom: "Catégorie Test" },
  images: [{ url: "img1.jpg" }],
};

const renderComponent = (props = {}) =>
  render(
    <BrowserRouter>
      <AdminProductCard
        product={productMock}
        {...props}
      />
    </BrowserRouter>
  );

describe("AdminProductCard", () => {

  it("affiche les informations du produit", () => {
    renderComponent();

    expect(screen.getByText("Produit Test")).toBeInTheDocument();
    expect(screen.getByText(/5 en stock/)).toBeInTheDocument();
    expect(screen.getByText(/Actif/)).toBeInTheDocument();
  });

  it("navigue vers la page produit au clic", () => {
    renderComponent();

    fireEvent.click(screen.getByText("Produit Test"));

    expect(mockNavigate).toHaveBeenCalledWith("/products/1");
  });

  it("appelle onEdit au clic sur modifier", () => {
    const onEdit = vi.fn();
    renderComponent({ onEdit });

    fireEvent.click(screen.getByTitle("Modifier le produit"));

    expect(onEdit).toHaveBeenCalledWith(productMock);
  });

  it("appelle onDelete après confirmation", () => {
    const onDelete = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderComponent({ onDelete });

    fireEvent.click(screen.getByTitle("Supprimer le produit"));

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it("toggle le statut", async () => {
    const onToggleStatus = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderComponent({ showToggle: true, onToggleStatus });

    const checkbox = screen.getByRole("checkbox");

    fireEvent.click(checkbox);

    expect(onToggleStatus).toHaveBeenCalledWith(1, false);
  });

});