import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import useInactiveProducts from "./useInactiveProducts";
import * as api from "../api/productApi";

// Mock API
vi.mock("../api/productApi");

describe("useInactiveProducts", () => {

  it("charge uniquement les produits inactifs", async () => {
    api.getAllProducts.mockResolvedValue([
      { id: 1, statut: true },
      { id: 2, statut: false },
      { id: 3, statut: false },
    ]);

    const { result } = renderHook(() => useInactiveProducts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products).toHaveLength(2);
    expect(result.current.products.every(p => p.statut === false)).toBe(true);
  });

  it("gère les erreurs", async () => {
    api.getAllProducts.mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useInactiveProducts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.products).toEqual([]);
  });

  it("refreshProducts recharge les données", async () => {
    const mockData = [{ id: 1, statut: false }];
    api.getAllProducts.mockResolvedValue(mockData);

    const { result } = renderHook(() => useInactiveProducts());

    await waitFor(() => {
      expect(result.current.products.length).toBe(1);
    });

    await result.current.refreshProducts();

    expect(api.getAllProducts).toHaveBeenCalledTimes(2);
  });

});