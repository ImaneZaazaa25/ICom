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
/* 
## La logique corrigée
```
AVANT (ton code) :
  InsufficientAuthenticationException  →  403  ❌ mauvais
  autre AuthenticationException        →  401  ❌ mauvais

APRÈS (code corrigé) :
  InsufficientAuthenticationException  →  401  ✅ pas de token = non identifié
  autre AuthenticationException        →  403  ✅ token présent mais mauvais rôle

*/


//version imane
// @Component
// public class AuthEntryPointJwt implements AuthenticationEntryPoint {
//     @Override
//     public void commence(HttpServletRequest request,
//                          HttpServletResponse response,
//                          AuthenticationException authException) throws IOException, ServletException {

//         if (authException instanceof InsufficientAuthenticationException) {
//             // Utilisateur authentifié mais pas autorisé
//             response.sendError(HttpServletResponse.SC_FORBIDDEN, "403 Non autorisé");
//         } else {
//             // Pas authentifié
//             response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "401 Non authentifié");
//         }
//     }
// }
