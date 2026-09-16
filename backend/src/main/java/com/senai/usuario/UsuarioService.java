package com.senai.usuario;

import com.senai.common.exception.ConflitoException;
import com.senai.common.exception.NaoAutorizadoException;
import com.senai.common.exception.NaoEncontradoException;
import com.senai.usuario.dto.*;
import io.quarkus.elytron.security.common.BcryptUtil;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.util.List;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 15/09/2026
 * @brief Class UsuarioService
 */
@ApplicationScoped
public class UsuarioService {
    private final UsuarioRepository repository;
    private final UsuarioMapper mapper;

    public UsuarioService(UsuarioRepository repository, UsuarioMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional
    public UsuarioResponse criar(CriarUsuarioRequest request) {
        if (repository.count("username = ?1", request.username()) > 0) {
            throw new ConflitoException("Usuário já existe");
        }

        if (repository.count("email = ?1", request.email()) > 0) {
            throw new ConflitoException("Email já cadastrado");
        }

        Usuario usuario = mapper.toEntity(request);
        usuario.setSenhaHash(BcryptUtil.bcryptHash(request.senha()));
        usuario.setAtivo(true);

        repository.persist(usuario);

        return mapper.toResponse(usuario);
    }

    @Transactional
    public UsuarioResponse atualizar(Long id, AtualizarUsuarioRequest request) {
        Usuario usuario = repository.findByIdOptional(id)
                .orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado"));

        // unicidade — só reclama se pertencer a OUTRO usuário
        boolean usernameEmUso = repository.count(
                "username = ?1 and id <> ?2", request.username(), id) > 0;
        if (usernameEmUso) {
            throw new ConflitoException("Username já está em uso");
        }
        boolean emailEmUso = repository.count(
                "email = ?1 and id <> ?2", request.email(), id) > 0;
        if (emailEmUso) {
            throw new ConflitoException("E-mail já está em uso");
        }

        // regra de negócio: não pode rebaixar o último admin ativo
        if (usuario.getTipoUsuario() == TipoUsuario.ADMINISTRADOR
                && request.tipoUsuario() != TipoUsuario.ADMINISTRADOR
                && repository.count("tipoUsuario = ?1 and ativo = true",
                TipoUsuario.ADMINISTRADOR) <= 1) {
            throw new ConflitoException(
                    "Não é possível rebaixar o último administrador ativo");
        }

        usuario.setNome(request.nome());
        usuario.setUsername(request.username());
        usuario.setEmail(request.email());
        usuario.setTipoUsuario(request.tipoUsuario());

        return mapper.toResponse(usuario);
    }

    @Transactional
    public void redefinirSenha(Long id, RedefinirSenhaRequest request) {
        Usuario usuario = repository.findByIdOptional(id)
                .orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado"));
        usuario.setSenhaHash(BcryptUtil.bcryptHash(request.novaSenha()));
    }

    @Transactional
    public void alterarSenhaPropria(String usernameLogado, AlterarSenhaRequest request) {
        Usuario usuario = repository.findAtivoByUsernameOrEmail(usernameLogado)
                .orElseThrow(NaoAutorizadoException::new);

        if (!BcryptUtil.matches(request.senhaAtual(), usuario.getSenhaHash())) {
            throw new NaoAutorizadoException();
        }

        usuario.setSenhaHash(BcryptUtil.bcryptHash(request.novaSenha()));
    }

    @Transactional
    public List<UsuarioResponse> listar() {
        return repository.listAll().stream().map(mapper::toResponse).toList();
    }

    @Transactional
    public UsuarioResponse buscarPorId(Long id) {
        var usuario = repository.findByIdOptional(id)
                .orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado"));

        return mapper.toResponse(usuario);
    }

    @Transactional
    public void desativar(Long id) {
        var usuario = repository.findByIdOptional(id)
                .orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado"));

        if (usuario.getTipoUsuario() == TipoUsuario.ADMINISTRADOR
                && usuario.isAtivo()
                && repository.count("tipoUsuario = ?1 and ativo = true", TipoUsuario.ADMINISTRADOR) <= 1) {
            throw new ConflitoException("Não é possível desativar o único administrador ativo do sistema");
        }

        usuario.setAtivo(false);
    }
}
