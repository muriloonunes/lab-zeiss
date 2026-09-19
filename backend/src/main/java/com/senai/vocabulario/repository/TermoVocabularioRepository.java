package com.senai.vocabulario.repository;

import com.senai.vocabulario.TermoVocabulario;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 18/09/2026
 * @brief Class TermoVocabularioRepository
 */

@ApplicationScoped
public class TermoVocabularioRepository implements PanacheRepository<TermoVocabulario> {
    public List<TermoVocabulario> listActiveByClasseId(Long classeId) {
        return list("classe.id = ?1 and ativo = true order by id desc", classeId);
    }

    public List<TermoVocabulario> listActiveOrAssinadoByUsuarioAndClasseId(Long classeId, Long usuarioId) {
        if (usuarioId == null) {
            return listActiveByClasseId(classeId);
        }
        return list(
                "classe.id = ?1 and (ativo = true or id in (select a.termo.id from AssinaturaAssunto a where a.usuarioId = ?2)) order by id desc",
                classeId,
                usuarioId
        );
    }

    public List<TermoVocabulario> listActiveByClasseNome(String nomeClasse) {
        return list("lower(classe.nome) = lower(?1) and ativo = true order by id desc", nomeClasse.trim());
    }

    public Optional<TermoVocabulario> findByDescricaoAndClasseId(String descricao, Long classeId) {
        return find("lower(descricao) = lower(?1) and classe.id = ?2", descricao.trim(), classeId).firstResultOptional();
    }

    public long countByClasseId(Long classeId) {
        return count("classe.id = ?1", classeId);
    }
}
