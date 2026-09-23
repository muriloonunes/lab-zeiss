package com.senai.servico.repository;

import com.senai.servico.domain.RegistroServico;
import com.senai.servico.domain.StatusLicao;
import com.senai.servico.domain.StatusServico;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Repositório Panache para operações em RegistroServico.
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 20/09/2026
 */
@ApplicationScoped
public class ServicoRepository implements PanacheRepository<RegistroServico> {

    public Optional<RegistroServico> findByCodigo(String codigo) {
        return find("codigo", codigo).firstResultOptional();
    }

    public Optional<RegistroServico> encontrarPorCodigo(String codigo) {
        return findByCodigo(codigo);
    }

    public List<RegistroServico> listarPorStatus(StatusServico status) {
        return find("status = ?1 order by dataCriacao desc", status).list();
    }

    public List<RegistroServico> listarTodosOrdenadosPorData() {
        return find("order by dataCriacao desc").list();
    }

    public List<RegistroServico> listarLicoesPendentesValidacao() {
        return find(
                "status = ?1 and blocoAprendizado.statusLicao = ?2 order by dataCriacao asc",
                StatusServico.CONCLUIDO,
                StatusLicao.EM_VALIDACAO
        ).list();
    }

    public long contarLicoesPendentesValidacao() {
        return count(
                "status = ?1 and blocoAprendizado.statusLicao = ?2",
                StatusServico.CONCLUIDO,
                StatusLicao.EM_VALIDACAO
        );
    }

    public List<RegistroServico> listarBaseConhecimento(StatusLicao statusLicao) {
        return listarBaseConhecimento(statusLicao, null, null, true);
    }

    public List<RegistroServico> listarBaseConhecimento(StatusLicao statusLicao, Long termoId, String busca) {
        return listarBaseConhecimento(statusLicao, termoId, busca, true);
    }

    public List<RegistroServico> listarBaseConhecimento(StatusLicao statusLicao, Long termoId, String busca, boolean podeVerRestritas) {
        StringBuilder query = new StringBuilder("select s from RegistroServico s where s.status = :status");
        Map<String, Object> params = new HashMap<>();
        params.put("status", StatusServico.CONCLUIDO);

        if (!podeVerRestritas) {
            query.append(" and (s.blocoAprendizado.restrito is null or s.blocoAprendizado.restrito = false)");
        }

        if (statusLicao != null) {
            query.append(" and s.blocoAprendizado.statusLicao = :statusLicao");
            params.put("statusLicao", statusLicao);
        } else {
            query.append(" and s.blocoAprendizado.statusLicao in (:stFormalizada, :stSuperada)");
            params.put("stFormalizada", StatusLicao.FORMALIZADA);
            params.put("stSuperada", StatusLicao.SUPERADA);
        }

        if (busca != null && !busca.trim().isBlank()) {
            query.append(" and (lower(s.codigo) like :busca or lower(s.blocoAprendizado.licaoAprendida) like :busca or lower(s.blocoAprendizado.causaDesvio.descricao) like :busca)");
            params.put("busca", "%" + busca.trim().toLowerCase() + "%");
        }

        if (termoId != null) {
            query.append(" and (s.blocoAprendizado.causaDesvio.id = :termoId or exists (select t from s.blocoAprendizado.assuntosRelacionados t where t.id = :termoId))");
            params.put("termoId", termoId);
        }

        return find(query + " order by s.dataCriacao desc", params).list();
    }
}
