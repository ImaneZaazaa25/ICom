package com.ICom.Icom.Exception;

// exception levée quand le stock est insuffisant pour une opération
public class StockInsuffisantException extends RuntimeException {

    public StockInsuffisantException(String message) {
        super(message);
    }
}