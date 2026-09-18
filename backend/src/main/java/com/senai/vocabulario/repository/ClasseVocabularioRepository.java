package com.senai.vocabulario.repository;

import com.senai.vocabulario.ClasseVocabulario;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 18/09/2026
 * @brief Class ClasseVocabularioRepository
 */
@ApplicationScoped
public class ClasseVocabularioRepository implements PanacheRepository<ClasseVocabulario> {
    public List<ClasseVocabulario> findAllAtivo() {
        return list("ativo = true order by nome asc");
    }

    public Optional<ClasseVocabulario> findByNomeIgnoreCase(String nome) {
        return find("lower(nome) = lower(?1)", nome.trim()).firstResultOptional();
    }

    public boolean existsByNome(String nome) {
        return count("lower(nome) = lower(?1)", nome.trim()) > 0;
    }
}
