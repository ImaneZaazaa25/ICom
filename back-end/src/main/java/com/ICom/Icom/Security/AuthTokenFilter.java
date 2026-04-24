package com.ICom.Icom.Security;

import com.ICom.Icom.Service.UserDetailService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
@RequiredArgsConstructor
public class AuthTokenFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;
    private final UserDetailService userDetailService;

    // filtre exécuté une seule fois par requête
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {

            // extraction du token JWT depuis la requête
            String jwt = parseJwt(request);

            // validation du token
            if (jwt != null && jwtUtil.validateJwtToken(jwt)) {

                // récupération du username depuis le token
                final String username = jwtUtil.getUserFromToken(jwt);

                // chargement de l'utilisateur depuis la base
                final UserDetails userDetails = userDetailService.loadUserByUsername(username);

                // création de l'objet d'authentification Spring Security
                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                // ajout des détails de la requête
                authenticationToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // enregistrement de l'utilisateur dans le SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }

        } catch (Exception e) {
            // erreur lors de l'authentification JWT
            log.error("on peut pas changer le user authentification");
        }

        // continuer la chaîne de filtres
        filterChain.doFilter(request, response);
    }

    // extraction du JWT depuis le header Authorization
    public String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            log.info("Authorization header = {}", headerAuth);
            return headerAuth.substring(7);
        }

        return null;
    }

    // exclusion de certains endpoints du filtre JWT
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        return path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.equals("/swagger-ui.html")
                || path.startsWith("/h2-console");
    }
}