package com.senai.auth;

import com.senai.auth.dto.LoginRequest;
import com.senai.common.exception.NaoAutorizadoException;
import com.senai.usuario.UsuarioRepository;
import io.quarkus.elytron.security.common.BcryptUtil;
import jakarta.enterprise.context.ApplicationScoped;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 15/09/2026
 * @brief Class AuthService
 */

@ApplicationScoped
public class AuthService {
    private final UsuarioRepository repository;
    private final TokenService tokenService;

    public AuthService(UsuarioRepository repository, TokenService tokenService) {
        this.repository = repository;
        this.tokenService = tokenService;
    }

    public String autenticar(LoginRequest request) {
        var usuario = repository.findAtivoByUsernameOrEmail(request.login())
                .filter(u -> BcryptUtil.matches(request.senha(), u.getSenhaHash()))
                .orElseThrow(NaoAutorizadoException::new);

        return tokenService.gerar(usuario);
    }
}
