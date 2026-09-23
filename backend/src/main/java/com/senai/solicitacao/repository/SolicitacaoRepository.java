package com.senai.solicitacao.repository;

import com.senai.solicitacao.domain.Solicitacao;
import com.senai.solicitacao.domain.StatusSolicitacao;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

/**
 * Repositório Panache para operações com Solicitações de Orçamento.
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 19/09/2026
 */
@ApplicationScoped
public class SolicitacaoRepository implements PanacheRepository<Solicitacao> {

    public List<Solicitacao> listarTodasOrdenadasPorData() {
        return listAll(Sort.descending("dataCriacao"));
    }

    public List<Solicitacao> listarPorStatus(StatusSolicitacao status) {
        return list("status = ?1", Sort.descending("dataCriacao"), status);
    }

    public Optional<Solicitacao> buscarPorCodigo(String codigo) {
        return find("codigo", codigo).firstResultOptional();
    }
}
