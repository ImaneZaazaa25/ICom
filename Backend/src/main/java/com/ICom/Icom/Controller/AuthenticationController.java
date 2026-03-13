package com.ICom.Icom.Controller;

import com.ICom.Icom.Model.User;
import com.ICom.Icom.Service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api")
public class AuthenticationController {

    private final AuthService authService;

    @PostMapping("/auth/signin")
    public String authenticateUser(@RequestBody User user){
        return authService.signin(user);
    }

    @PostMapping("/auth/signup")
    public String registerUser(@RequestBody User user){
        return authService.signup(user);
    }



}