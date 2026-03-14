package com.ICom.Icom.Service;


import com.ICom.Icom.Model.User;
import com.ICom.Icom.Repositories.UserRepository;
import com.ICom.Icom.Security.JWTUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JWTUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public String signin(User user) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getUsername(),
                        user.getMotdepasse()
                )
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return jwtUtil.generateToken(userDetails.getUsername());
    }

    public String signup(User user) {

        if (userRepository.existsByUsername(user.getUsername())) {
            return "User existe deja";
        }

        User newUser = new User(
                null,
                user.getNom(),
                user.getPrenom(),
                user.getUsername(),
                user.getEmail(),
                passwordEncoder.encode(user.getMotdepasse()),
                user.getRole(),
                user.getTel(),
                user.getStatus()
        );

        userRepository.save(newUser);

        return "User enregistrer avec succes" ;// mieux : retourner le token directement
    }
}