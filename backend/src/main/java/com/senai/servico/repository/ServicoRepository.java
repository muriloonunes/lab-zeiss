package com.senai.servico.repository;

import com.senai.servico.domain.RegistroServico;
import com.senai.servico.domain.StatusLicao;
import com.senai.servico.domain.StatusServico;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 20/09/2026
 * @brief Classe ServicoRepository
 */
@ApplicationScoped
public class ServicoRepository implements PanacheRepository<RegistroServico> {

    public List<RegistroServico> listarTodosOrdenadosPorData() {
        return listAll(Sort.descending("dataCriacao"));
    }

    public List<RegistroServico> listarPorStatus(StatusServico status) {
        return list("status = ?1", Sort.descending("dataCriacao"), status);
    }

    public Optional<RegistroServico> encontrarPorCodigo(String codigo) {
        return find("codigo", codigo).firstResultOptional();
    }

    public List<RegistroServico> listarLicoesPendentesValidacao() {
        return list(
                "status = ?1 and blocoAprendizado.statusLicao = ?2",
                Sort.descending("dataCriacao"),
                StatusServico.CONCLUIDO,
                StatusLicao.EM_VALIDACAO
        );
    }

    public long contarLicoesPendentesValidacao() {
        return count(
                "status = ?1 and blocoAprendizado.statusLicao = ?2",
                StatusServico.CONCLUIDO,
                StatusLicao.EM_VALIDACAO
        );
    }

    public List<RegistroServico> listarBaseConhecimento(StatusLicao statusLicao) {
        if (statusLicao != null) {
            return list(
                    "status = ?1 and blocoAprendizado.statusLicao = ?2",
                    Sort.descending("dataCriacao"),
                    StatusServico.CONCLUIDO,
                    statusLicao
            );
        }
        return list(
                "status = ?1 and blocoAprendizado.statusLicao in (?2, ?3)",
                Sort.descending("dataCriacao"),
                StatusServico.CONCLUIDO,
                StatusLicao.FORMALIZADA,
                StatusLicao.SUPERADA
        );
    }
}
