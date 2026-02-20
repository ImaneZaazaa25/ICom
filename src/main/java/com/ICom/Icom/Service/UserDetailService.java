package com.ICom.Icom.Service;

import com.ICom.Icom.Model.User;
import com.ICom.Icom.Repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@RequiredArgsConstructor
@Service
public class UserDetailService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user=userRepository.findByUsername(username);
        if(user==null){
            throw new UsernameNotFoundException("username :"+username +"n existe pas");
        }
         return new org.springframework.security.core.userdetails.User(
                 user.getUsername(),
                 user.getMotdepasse(),
                 List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
         );
        }
    }

