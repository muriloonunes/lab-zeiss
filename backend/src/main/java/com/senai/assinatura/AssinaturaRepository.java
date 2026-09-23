package com.senai.assinatura;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 19/09/2026
 * @brief Class AssinaturaRepository
 */
@ApplicationScoped
public class AssinaturaRepository implements PanacheRepository<AssinaturaAssunto> {
    public List<AssinaturaAssunto> listarPorUsuario(Long idUsuario) {
        return list("usuarioId = ?1", idUsuario);
    }

    public Optional<AssinaturaAssunto> listarPorUsuarioETermo(Long idUsuario, Long idTermo) {
        return find("usuarioId = ?1 and termo.id = ?2", idUsuario, idTermo).firstResultOptional();
    }

    public long deleteByUsuarioETermo(Long idUsuario, Long termoId) {
        return delete("usuarioId = ?1 and termo.id = ?2", idUsuario, termoId);
    }

    public List<AssinaturaAssunto> listarPorTermos(Collection<Long> termosIds) {
        if (termosIds == null || termosIds.isEmpty()) {
            return List.of();
        }
        return list("termo.id in ?1", termosIds);
    }
}
