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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@RequiredArgsConstructor
@EnableMethodSecurity(prePostEnabled = true)
@Configuration
public class WebSecurityConfig {
    private final UserDetailService userDetailService;
    private final AuthEntryPointJwt authEntryPointJwt;
    private final AuthTokenFilter authTokenFilter;

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration)throws Exception{
        return authenticationConfiguration.getAuthenticationManager();
    }
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(AbstractHttpConfigurer::disable)
                .exceptionHandling(e -> e.authenticationEntryPoint(authEntryPointJwt))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a
                        // Endpoints publics : auth + lecture catalogue
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/welcome").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/produits/**").permitAll()

                        // Écriture produits/catégories : Admin uniquement
                        .requestMatchers(HttpMethod.POST, "/api/produits/**").hasRole("Admin")
                        .requestMatchers(HttpMethod.PUT, "/api/produits/**").hasRole("Admin")
                        .requestMatchers(HttpMethod.DELETE, "/api/produits/**").hasRole("Admin")
                        .requestMatchers("/api/admin/**").hasRole("Admin")

                        // Profil, panier, commandes : User ou Admin authentifié
                        .requestMatchers("/api/user/**").hasAnyRole("User", "Admin")
                        .requestMatchers("/api/panier/**").hasAnyRole("User", "Admin")
                        .requestMatchers("/api/commandes/**").hasAnyRole("User", "Admin")

                        // Tout le reste : authentifié
                        .anyRequest().authenticated()
                );
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);



        return http.build();

    }

}