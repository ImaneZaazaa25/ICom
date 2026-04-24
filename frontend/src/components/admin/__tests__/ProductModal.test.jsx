import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProductModal from "../ProductModal";
import axios from "axios";

vi.mock("axios");

const categoriesMock = [
  { id: 1, nom: "Catégorie 1" },
  { id: 2, nom: "Catégorie 2" },
];

describe("ProductModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

    expect(
      screen.getByRole("heading", { name: /Ajouter un produit/i })
    ).toBeInTheDocument();
  });

  it("remplit les champs", () => {
    setup();

    const input = screen.getByLabelText(/Nom/i);

    fireEvent.change(input, {
      target: { value: "Produit X" },
    });

    expect(input.value).toBe("Produit X");
  });

  it("validation échoue si nom vide", async () => {
    const alertMock = vi
      .spyOn(window, "alert")
      .mockImplementation(() => {});

    setup();

    fireEvent.click(
      screen.getByRole("button", { name: /Ajouter/i })
    );

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        "Le nom du produit est requis"
      );
    });
  });

  it("validation échoue si prix invalide", async () => {
    const alertMock = vi
      .spyOn(window, "alert")
      .mockImplementation(() => {});

    setup();

    fireEvent.change(screen.getByLabelText(/Nom/i), {
      target: { value: "Produit X" },
    });

    fireEvent.change(screen.getByLabelText(/Prix/i), {
      target: { value: "-10" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Ajouter/i })
    );

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        "Le prix doit être un nombre positif"
      );
    });
  });

  it("validation échoue si quantité invalide", async () => {
    const alertMock = vi
      .spyOn(window, "alert")
      .mockImplementation(() => {});

    setup();

    fireEvent.change(screen.getByLabelText(/Nom/i), {
      target: { value: "Produit X" },
    });

    fireEvent.change(screen.getByLabelText(/Prix/i), {
      target: { value: "100" },
    });

    fireEvent.change(screen.getByLabelText(/Quantité/i), {
      target: { value: "-5" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Ajouter/i })
    );

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        "La quantité doit être un nombre valide"
      );
    });
  });

  it("crée un produit (POST)", async () => {
    axios.post.mockResolvedValue({ data: { id: 10 } });

    const alertMock = vi
      .spyOn(window, "alert")
      .mockImplementation(() => {});

    const onSubmit = vi.fn();
    const onClose = vi.fn();

    setup({ onSubmit, onClose });

    fireEvent.change(screen.getByLabelText(/Nom/i), {
      target: { value: "Produit X" },
    });

    fireEvent.change(screen.getByLabelText(/Prix/i), {
      target: { value: "100" },
    });

    fireEvent.change(screen.getByLabelText(/Quantité/i), {
      target: { value: "5" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Ajouter/i })
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(onSubmit).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
      expect(alertMock).toHaveBeenCalledWith(
        "Produit enregistré avec succès !"
      );
    });
  });

  it("modifie un produit (PUT)", async () => {
    axios.put.mockResolvedValue({});

    const alertMock = vi
      .spyOn(window, "alert")
      .mockImplementation(() => {});

    const product = {
      id: 1,
      nom: "Produit existant",
      prix: 50,
      quantite: 3,
      statut: true,
      categorie: { id: 1 },
    };

    setup({ product });

    fireEvent.change(screen.getByLabelText(/Nom/i), {
      target: { value: "Updated" },
    });

    fireEvent.change(screen.getByLabelText(/Prix/i), {
      target: { value: "200" },
    });

    fireEvent.change(screen.getByLabelText(/Quantité/i), {
      target: { value: "10" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Modifier/i })
    );

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
      expect(alertMock).toHaveBeenCalledWith(
        "Produit enregistré avec succès !"
      );
    });
  });
});