package com.ICom.Icom.Security;

import com.ICom.Icom.Service.UserDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
                        // endpoints publics (adapte selon ton API)
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/welcome").permitAll()
                        // routes ADMIN
                        .requestMatchers("/api/admin/**").hasRole("Admin")

                        //routes USER (et ADMIN aussi si tu veux)
                        .requestMatchers("/api/user/**").hasAnyRole("User", "Admin")
                        // tout le reste protégé
                        .anyRequest().authenticated()
                );
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);



        return http.build();

    }

}
