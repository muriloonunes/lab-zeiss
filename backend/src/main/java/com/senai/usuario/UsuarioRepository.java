package com.senai.usuario;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 15/09/2026
 * @brief Class UsuarioRepository
 */
@ApplicationScoped
public class UsuarioRepository implements PanacheRepository<Usuario> {
    public Optional<Usuario> findAtivoByUsernameOrEmail(String login) {
        String normalizado = login.trim().toLowerCase();
        return find("ativo = true and (lower(username) = ?1 or lower(email) = ?1)", normalizado)
                .firstResultOptional();
    }

    public List<Usuario> listarAtivosPorTipos(TipoUsuario... tipos) {
        return list("ativo = true and tipoUsuario in ?1", Arrays.asList(tipos));
    }
}
