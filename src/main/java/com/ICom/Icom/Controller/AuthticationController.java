package com.ICom.Icom.Controller;

import com.ICom.Icom.Model.User;
import com.ICom.Icom.Repositories.UserRepository;
import com.ICom.Icom.Security.JWTUtil;
import com.ICom.Icom.Service.AuthService;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
public class AuthticationController {

    private final AuthService authService;

    @PostMapping("/auth/signin")
    public String authenticateUser(@RequestBody User user){
        return authService.signin(user);
    }

    @PostMapping("/auth/signup")
    public String registerUser(@RequestBody User user){
        return authService.signup(user);
    }

    @GetMapping("/welcome")
    public String WelcomeTest(){
        return "Welcome!!";
    }
}