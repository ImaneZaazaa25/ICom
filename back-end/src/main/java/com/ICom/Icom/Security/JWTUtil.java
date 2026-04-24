package com.ICom.Icom.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
public class JWTUtil {

    // clé secrète JWT (depuis application.properties)
    @Value("${jwt.secret}")
    private String jwtSecret;

    // durée de validité du token (en millisecondes)
    @Value("${jwt.expiration}")
    private long jwtExpiration;

    private SecretKey key;

    // initialisation de la clé après injection des propriétés
    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(io.jsonwebtoken.io.Decoders.BASE64.decode(jwtSecret));
    }

    // génération du token JWT
    // contient username + roles + expiration
    public String generateToken(UserDetails userDetails) {

        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpiration);

        // récupération des rôles de l'utilisateur
        List<String> roles = userDetails.getAuthorities()
                .stream()
                .map(auth -> auth.getAuthority())
                .collect(Collectors.toList());

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("roles", roles)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key)
                .compact();
    }

    // récupération du username depuis le token
    public String getUserFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    // récupération des rôles depuis le token
    public List<String> getRolesFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.get("roles", List.class);
    }

    // validation du token JWT (signature + expiration)
    public boolean validateJwtToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            log.error("JWT validation error: {}", e.getMessage());
            return false;
        }
    }
}