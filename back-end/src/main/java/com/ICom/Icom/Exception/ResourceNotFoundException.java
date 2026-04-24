package com.ICom.Icom.Exception;

// exception levée quand une ressource n'est pas trouvée en base
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}