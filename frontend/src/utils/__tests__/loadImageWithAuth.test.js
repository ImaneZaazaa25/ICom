import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { loadImageWithAuth } from "./loadImageWithAuth";

// Mock axios
vi.mock("axios");

describe("loadImageWithAuth", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("charge une image avec token et retourne une URL blob", async () => {
    const fakeBlob = new Blob(["fake image"], { type: "image/png" });

    // mock localStorage
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("fake-token");

    // mock axios
    axios.get.mockResolvedValue({ data: fakeBlob });

    // mock createObjectURL
    const mockUrl = "blob:http://localhost/fake";
    vi.spyOn(URL, "createObjectURL").mockReturnValue(mockUrl);

    const result = await loadImageWithAuth("http://test.com/image");

    expect(axios.get).toHaveBeenCalledWith("http://test.com/image", {
      headers: {
        Authorization: "Bearer fake-token",
      },
      responseType: "blob",
    });

    expect(URL.createObjectURL).toHaveBeenCalledWith(fakeBlob);
    expect(result).toBe(mockUrl);
  });

  it("retourne null en cas d'erreur", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("fake-token");

    axios.get.mockRejectedValue(new Error("Network error"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await loadImageWithAuth("http://test.com/image");

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("fonctionne même sans token", async () => {
    const fakeBlob = new Blob(["img"], { type: "image/png" });

    vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
    axios.get.mockResolvedValue({ data: fakeBlob });

    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:url");

    const result = await loadImageWithAuth("http://test.com/image");

    expect(axios.get).toHaveBeenCalledWith("http://test.com/image", {
      headers: {
        Authorization: "Bearer null",
      },
      responseType: "blob",
    });

    expect(result).toBe("blob:url");
  });

});