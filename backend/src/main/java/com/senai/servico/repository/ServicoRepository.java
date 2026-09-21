package com.senai.servico.repository;

import com.senai.servico.domain.RegistroServico;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 20/09/2026
 * @brief Classe ServicoRepository
 */
@ApplicationScoped
public class ServicoRepository implements PanacheRepository<RegistroServico> {
    public Optional<RegistroServico> encontrarPorCodigo(String codigo) {
        return find("codigo", codigo).firstResultOptional();
    }
}
