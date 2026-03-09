package com.ICom.Icom.Security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

        if (authException instanceof InsufficientAuthenticationException) {//Updated
            // Utilisateur authentifié mais pas autorisé
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "401 Non authentifié");
        } else {
            // Pas authentifié
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "403 Non autorisé");
        }
    }
}
