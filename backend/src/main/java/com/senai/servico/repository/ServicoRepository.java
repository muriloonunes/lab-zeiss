package com.senai.servico.repository;

import com.senai.servico.domain.RegistroServico;
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
}
