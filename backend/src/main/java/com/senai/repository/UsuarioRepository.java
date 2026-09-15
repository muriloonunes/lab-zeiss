package com.senai.repository;

import com.senai.model.Usuario;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

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
        return find("ativo = true and (username = ?1 or email = ?1)", login).firstResultOptional();
    }
}
