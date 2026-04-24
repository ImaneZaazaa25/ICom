import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AuthContext } from "../context/AuthContext";
import useAuth from "./useAuth";

describe("useAuth", () => {

  it("retourne le contexte auth", () => {
    const wrapper = ({ children }) => (
      <AuthContext.Provider value={{ user: { name: "Imane" } }}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user.name).toBe("Imane");
  });

  it("retourne {} si pas de provider", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current).toEqual({});
  });

});