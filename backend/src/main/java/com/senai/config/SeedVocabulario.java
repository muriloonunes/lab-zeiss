package com.senai.config;

import com.senai.vocabulario.ClasseVocabulario;
import com.senai.vocabulario.TermoVocabulario;
import com.senai.vocabulario.repository.ClasseVocabularioRepository;
import com.senai.vocabulario.repository.TermoVocabularioRepository;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 18/09/2026
 * @brief Class SeedVocabulario
 */
@ApplicationScoped
public class SeedVocabulario {
    private static final Logger LOGGER = Logger.getLogger(SeedVocabulario.class);

    private final ClasseVocabularioRepository classeRepository;
    private final TermoVocabularioRepository termoRepository;

    public SeedVocabulario(ClasseVocabularioRepository classeRepository,
                           TermoVocabularioRepository termoRepository) {
        this.classeRepository = classeRepository;
        this.termoRepository = termoRepository;
    }

    @Transactional
    void onStart(@Observes StartupEvent event) {
        if (classeRepository.count() > 0) {
            return;
        }

        LOGGER.info("Populando vocabulário controlado mínimo...");

        criarClasse("Tipo de Serviço", "MMC", "Digitalização 3D", "Engenharia Reversa", "Elaboração de Laudo");

        criarClasse("Característica da Peça", "Grande Porte", "Médio Porte", "Pequeno Porte", "Peça Única", "Peça em Série", "Diâmetro Pequeno", "Diâmetro Médio", "Diâmetro Grande", "Peça Complexa", "Peça Simples");

        criarClasse("Recurso", "DuraMax", "Prismo", "OInspect", "Bosello", "T-Scan", "ATOS Q", "ZRE", "Zeiss Inspect");

        criarClasse("Causa do Desvio", "Fixação mais complexa", "Peça com geometria complexa", "Mudança de escopo pelo cliente");
    }

    private void criarClasse(String nomeClasse, String... termos) {
        var classe = new ClasseVocabulario();
        classe.setNome(nomeClasse);
        classe.setAtivo(true);
        classe.setClasseBase(true);
        classeRepository.persist(classe);

        for (String termo : termos) {
            var termoVocabulario = new TermoVocabulario();
            termoVocabulario.setDescricao(termo);
            termoVocabulario.setAtivo(true);
            termoVocabulario.setClasse(classe);
            termoRepository.persist(termoVocabulario);
        }
    }
}
