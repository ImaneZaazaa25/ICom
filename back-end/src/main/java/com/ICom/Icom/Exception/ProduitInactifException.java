package com.ICom.Icom.Exception;

// exception levée quand un produit est inactif
public class ProduitInactifException extends RuntimeException {

    public ProduitInactifException(String message) {
        super(message);
    }
}