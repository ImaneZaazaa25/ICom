package com.ICom.Icom.Service;

import com.ICom.Icom.DTO.UpdateProfileDTO;
import com.ICom.Icom.DTO.UserProfileDTO;
import com.ICom.Icom.Exception.ResourceNotFoundException;
import com.ICom.Icom.Model.User;
import com.ICom.Icom.Repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileDTO getProfil(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new ResourceNotFoundException("Utilisateur non trouvé : " + username);
        }
        return mapToDTO(user);
    }

    public UserProfileDTO updateProfil(String username, UpdateProfileDTO dto) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new ResourceNotFoundException("Utilisateur non trouvé : " + username);
        }

        // Mise à jour partielle : seulement les champs fournis (non null, non vide)
        if (dto.getNom() != null && !dto.getNom().isBlank()) {
            user.setNom(dto.getNom());
        }
        if (dto.getPrenom() != null && !dto.getPrenom().isBlank()) {
            user.setPrenom(dto.getPrenom());
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            user.setEmail(dto.getEmail());
        }
        if (dto.getTel() != null && !dto.getTel().isBlank()) {
            user.setTel(dto.getTel());
        }
        if (dto.getMotdepasse() != null && !dto.getMotdepasse().isBlank()) {
            user.setMotdepasse(passwordEncoder.encode(dto.getMotdepasse()));
        }

        return mapToDTO(userRepository.save(user));
    }

    private UserProfileDTO mapToDTO(User user) {
        return new UserProfileDTO(
                user.getIdUser(),
                user.getNom(),
                user.getPrenom(),
                user.getUsername(),
                user.getEmail(),
                user.getTel(),
                user.getRole(),
                user.getStatus()
        );
    }
}
