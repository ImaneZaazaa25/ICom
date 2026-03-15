import React from "react";
import { createRoot } from "react-dom/client";
import AppRoutes from "./routes/AppRoutes.jsx"; // ton fichier de routes
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);