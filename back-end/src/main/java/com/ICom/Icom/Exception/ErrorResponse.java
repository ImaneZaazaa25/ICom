package com.ICom.Icom.Exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    // code HTTP de l'erreur (ex: 404, 500, 401)
    private int status;

    // message décrivant l'erreur
    private String message;
}