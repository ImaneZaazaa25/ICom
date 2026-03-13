package com.ICom.Icom.DTO;

import com.ICom.Icom.Model.Role;
import com.ICom.Icom.Model.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private Long idUser;
    private String nom;
    private String prenom;
    private String username;
    private String email;
    private String tel;
    private Role role;
    private Status status;
}
