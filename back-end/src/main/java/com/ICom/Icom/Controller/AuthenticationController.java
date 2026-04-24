package com.ICom.Icom.Controller;

import com.ICom.Icom.Model.User;
import com.ICom.Icom.Service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class AuthenticationController {

    private final AuthService authService;

    /**
     *
     * @param user
     * @return
     */

    @PostMapping("/auth/signin")
    public String authenticateUser(@RequestBody User user){
        return authService.signin(user);
    }

    /**
     *
     * @param user
     * @return
     */
    @PostMapping("/auth/signup")
    public String registerUser(@RequestBody User user){
        return authService.signup(user);
    }



}