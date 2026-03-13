package com.ICom.Icom.Controller;

import com.ICom.Icom.DTO.UpdateProfileDTO;
import com.ICom.Icom.DTO.UserProfileDTO;
import com.ICom.Icom.Service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/user/profile → retourne les vraies infos depuis la BDD (via username JWT)
    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getProfil(Authentication authentication) {
        return ResponseEntity.ok(userService.getProfil(authentication.getName()));
    }

    // PUT /api/user/profile → modifier ses infos personnelles (nom, email, mot de passe…)
    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateProfil(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileDTO dto) {
        return ResponseEntity.ok(userService.updateProfil(authentication.getName(), dto));
    }
}
