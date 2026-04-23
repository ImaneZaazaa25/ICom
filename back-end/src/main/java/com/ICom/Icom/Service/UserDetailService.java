package com.ICom.Icom.Service;

import com.ICom.Icom.Model.User;
import com.ICom.Icom.Repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class UserDetailService implements UserDetailsService {

    private final UserRepository userRepository;

    // charge l'utilisateur pour Spring Security (authentification)
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User user = userRepository.findByUsername(username);

        // utilisateur introuvable
        if (user == null) {
            throw new UsernameNotFoundException("username : " + username + " n'existe pas");
        }

        // création de l'utilisateur Spring Security avec rôle
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getMotdepasse(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}