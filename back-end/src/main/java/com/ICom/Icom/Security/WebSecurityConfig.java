package com.ICom.Icom.Security;

import com.ICom.Icom.Service.UserDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.security.config.Customizer;

@RequiredArgsConstructor
@EnableMethodSecurity(prePostEnabled = true)
@Configuration
public class WebSecurityConfig {

    private final UserDetailService userDetailService;
    private final AuthEntryPointJwt authEntryPointJwt;
    private final AuthTokenFilter authTokenFilter;

    // endpoints autorisés pour Swagger / documentation API
    private static final String[] SWAGGER_WHITELIST = {
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/v3/api-docs",
    };

    // configuration CORS pour autoriser le frontend React
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // autorise le frontend local
        configuration.addAllowedOrigin("http://localhost:5173");

        // autorise toutes les méthodes HTTP
        configuration.addAllowedMethod("*");

        // autorise tous les headers
        configuration.addAllowedHeader("*");

        // permet l'envoi de cookies / JWT
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    // gestionnaire d'authentification Spring Security
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    // encoder des mots de passe (BCrypt)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =========================
    // CHAIN 1 : SWAGGER / DOCS
    // =========================
    // aucune sécurité appliquée ici
    @Bean
    @Order(1)
    public SecurityFilterChain swaggerFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher(SWAGGER_WHITELIST)
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(a -> a.anyRequest().permitAll());

        return http.build();
    }

    // =========================
    // CHAIN 2 : API PRINCIPALE (JWT)
    // =========================
    @Bean
    @Order(2)
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // désactivation CSRF (API REST stateless)
                .csrf(AbstractHttpConfigurer::disable)

                // activation CORS
                .cors(Customizer.withDefaults())

                // gestion des erreurs d'authentification
                .exceptionHandling(e -> e.authenticationEntryPoint(authEntryPointJwt))

                // session stateless (JWT)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(a -> a

                        // H2 console (dev)
                        .requestMatchers("/h2-console/**").permitAll()

                        // fichiers uploadés accessibles publiquement
                        .requestMatchers("/uploads/**").permitAll()

                        // endpoints publics
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/welcome").permitAll()

                        // lecture produits & catégories (public)
                        .requestMatchers(HttpMethod.GET, "/api/produits/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()

                        // gestion produits (admin uniquement)
                        .requestMatchers(HttpMethod.POST, "/api/produits/**").hasRole("Admin")
                        .requestMatchers(HttpMethod.PUT, "/api/produits/**").hasRole("Admin")
                        .requestMatchers(HttpMethod.DELETE, "/api/produits/**").hasRole("Admin")

                        // zone admin
                        .requestMatchers("/api/admin/**").hasRole("Admin")

                        // utilisateur connecté (user ou admin)
                        .requestMatchers("/api/user/**").hasAnyRole("User", "Admin")
                        .requestMatchers("/api/panier/**").hasAnyRole("User", "Admin")
                        .requestMatchers("/api/commandes/**").hasAnyRole("User", "Admin")

                        // toute autre requête nécessite authentification
                        .anyRequest().authenticated()
                );

        // désactive protection frame (H2 console)
        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

        // ajout du filtre JWT avant auth classique Spring
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}