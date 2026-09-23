package com.senai.notificacao.repository;

import com.senai.notificacao.domain.Notificacao;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 22/09/2026
 * @brief Class NotificacaoRepository
 */
@ApplicationScoped
public class NotificacaoRepository implements PanacheRepository<Notificacao> {

    public List<Notificacao> listarPorUsuario(Long usuarioId) {
        return list("usuarioId = ?1", Sort.descending("dataCriacao"), usuarioId);
    }

    public long contarNaoLidasPorUsuario(Long usuarioId) {
        return count("usuarioId = ?1 and lida = false", usuarioId);
    }

    public Optional<Notificacao> buscarPorIdEUsuario(Long id, Long usuarioId) {
        return find("id = ?1 and usuarioId = ?2", id, usuarioId).firstResultOptional();
    }

    public void marcarTodasComoLidas(Long usuarioId) {
        update("lida = true where usuarioId = ?1 and lida = false", usuarioId);
    }

    public long deletarPorIdEUsuario(Long id, Long usuarioId) {
        return delete("id = ?1 and usuarioId = ?2", id, usuarioId);
    }
}
