package com.watchweb.app.security;

import com.watchweb.app.domain.user.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public class UserPrincipal implements UserDetails {

    private final UUID id;
    private final String email;
    private final String passwordHash;
    private final List<GrantedAuthority> authorities;

    private UserPrincipal(UUID id, String email, String passwordHash, List<GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.authorities = authorities;
    }

    public static UserPrincipal fromEntity(User user) {
        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                List.of(new SimpleGrantedAuthority(user.getRole().name()))
        );
    }

    public UUID getId() {
        return id;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }
}
