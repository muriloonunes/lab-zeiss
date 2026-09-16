package com.senai.auth;

import com.senai.usuario.Usuario;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.time.Duration;
import java.time.Instant;
import java.util.Set;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 15/09/2026
 * @brief Class TokenService
 */
@ApplicationScoped
public class TokenService {
    @ConfigProperty(name = "mp.jwt.verify.issuer")
    String issuer;

    public String gerar(Usuario usuario) {
        return Jwt.issuer(issuer)
                .upn(usuario.getUsername())
                .subject(usuario.getId().toString())
                .groups(Set.of(usuario.getTipoUsuario().name()))
                .expiresAt(Instant.now().plus(Duration.ofHours(8)))
                .sign();
    }
}
