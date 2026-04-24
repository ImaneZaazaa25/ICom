import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ProductModal from "./ProductModal";
import axios from "axios";

vi.mock("axios");

const categoriesMock = [
  { id: 1, nom: "Catégorie 1" },
  { id: 2, nom: "Catégorie 2" },
];

describe("ProductModal", () => {

  const setup = (props = {}) =>
    render(
      <ProductModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        categories={categoriesMock}
        {...props}
      />
    );

  it("affiche le modal", () => {
    setup();

    expect(screen.getByText(/Ajouter un produit/)).toBeInTheDocument();
  });

  it("remplit les champs", () => {
    setup();

    fireEvent.change(screen.getByLabelText(/Nom/), {
      target: { value: "Produit X" },
    });

    expect(screen.getByDisplayValue("Produit X")).toBeInTheDocument();
  });

  it("validation échoue si nom vide", async () => {
    vi.spyOn(window, "alert").mockImplementation(() => {});

    setup();

    fireEvent.click(screen.getByText("Ajouter"));

    expect(window.alert).toHaveBeenCalled();
  });

  it("crée un produit (POST)", async () => {
    axios.post.mockResolvedValue({ data: { id: 10 } });
    vi.spyOn(window, "alert").mockImplementation(() => {});

    const onSubmit = vi.fn();
    const onClose = vi.fn();

    setup({ onSubmit, onClose });

    fireEvent.change(screen.getByLabelText(/Nom/), {
      target: { value: "Produit X" },
    });

    fireEvent.change(screen.getByLabelText(/Prix/), {
      target: { value: "100" },
    });

    fireEvent.change(screen.getByLabelText(/Quantité/), {
      target: { value: "5" },
    });

    fireEvent.click(screen.getByText("Ajouter"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(onSubmit).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("modifie un produit (PUT)", async () => {
    axios.put.mockResolvedValue({});
    vi.spyOn(window, "alert").mockImplementation(() => {});

    const product = {
      id: 1,
      nom: "Produit existant",
      prix: 50,
      quantite: 3,
      statut: true,
      categorie: { id: 1 },
    };

    setup({ product });

    fireEvent.change(screen.getByLabelText(/Nom/), {
      target: { value: "Updated" },
    });

    fireEvent.click(screen.getByText("Modifier"));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
    });
  });

});