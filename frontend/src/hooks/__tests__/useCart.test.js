import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CartContext } from "../context/CartContext";
import useCart from "./useCart";

describe("useCart", () => {

  it("retourne les données du panier", () => {
    const mockCart = {
      cartItems: [{ id: 1, quantity: 2 }],
      total: 200,
    };

    const wrapper = ({ children }) => (
      <CartContext.Provider value={mockCart}>
        {children}
      </CartContext.Provider>
    );

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.cartItems.length).toBe(1);
    expect(result.current.total).toBe(200);
  });

});