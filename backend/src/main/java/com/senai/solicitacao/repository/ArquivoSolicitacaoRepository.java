package com.senai.solicitacao.repository;

import com.senai.solicitacao.domain.ArquivoSolicitacao;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

/**
 * Repositório Panache para arquivos anexados às solicitações.
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 19/09/2026
 */
@ApplicationScoped
public class ArquivoSolicitacaoRepository implements PanacheRepository<ArquivoSolicitacao> {

    public List<ArquivoSolicitacao> listarPorSolicitacao(Long solicitacaoId) {
        return list("solicitacao.id = ?1", solicitacaoId);
    }

    public Optional<ArquivoSolicitacao> buscarPorSolicitacaoEId(Long solicitacaoId, Long arquivoId) {
        return find("solicitacao.id = ?1 and id = ?2", solicitacaoId, arquivoId).firstResultOptional();
    }
}
