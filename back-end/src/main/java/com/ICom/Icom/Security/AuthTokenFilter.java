package com.ICom.Icom.Security;

import com.ICom.Icom.Service.UserDetailService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
@RequiredArgsConstructor
public class AuthTokenFilter extends OncePerRequestFilter {
    private final JWTUtil jwtUtil;
    private final UserDetailService userDetailService;
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try{
            String jwt=parseJwt(request);
            if(jwt!=null && jwtUtil.validateJwtToken(jwt)){
                final String username=jwtUtil.getUserFromToken(jwt);
                final UserDetails userDetails=userDetailService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken authenticationToken=new UsernamePasswordAuthenticationToken(userDetails,
                        null,userDetails.getAuthorities());
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
        }catch (Exception e){
            log.error("on peut pas changer le user authentification");
        }
        filterChain.doFilter(request,response);
    }
    public String parseJwt(HttpServletRequest request){
        String headerAuth= request.getHeader("Authorization");
        if(headerAuth!=null && headerAuth.startsWith("Bearer ")){
            log.info("Authorization header = {}", request.getHeader("Authorization"));
            return headerAuth.substring(7);
        }
        return null;
    }

}
