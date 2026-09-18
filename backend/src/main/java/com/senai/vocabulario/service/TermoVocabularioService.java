package com.senai.vocabulario.service;

import com.senai.vocabulario.ClasseVocabulario;
import com.senai.vocabulario.TermoVocabulario;
import com.senai.vocabulario.repository.TermoVocabularioRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 18/09/2026
 * @brief Class TermoVocabularioService
 */
@ApplicationScoped
public class TermoVocabularioService {
    @Inject
    TermoVocabularioRepository termoRepository;

    @Inject
    ClasseVocabularioService classeService;

    public List<TermoVocabulario> listarAtivosPorClasse(Long classeId) {
        return termoRepository.listActiveByClasseId(classeId);
    }

    public List<TermoVocabulario> listarAtivosPorNomeClasse(String nomeClasse) {
        return termoRepository.listActiveByClasseNome(nomeClasse);
    }

    public List<TermoVocabulario> listarTodosPorClasse(Long classeId) {
        return termoRepository.list("classe.id = ?1 order by descricao asc", classeId);
    }

    public TermoVocabulario buscarPorId(Long id) {
        return termoRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Termo de vocabulário não encontrado."));
    }

    @Transactional
    public TermoVocabulario criar(Long classeId, String descricao) {
        ClasseVocabulario classe = classeService.buscarEntityPorId(classeId);

        if (!classe.isAtivo()) {
            throw new BadRequestException("Não é possível associar novos termos a uma classe inativa.");
        }

        String descricaoFormatada = sanitizarTexto(descricao);

        termoRepository.findByDescricaoAndClasseId(descricaoFormatada, classeId)
                .ifPresent(existente -> {
                    throw new BadRequestException("O termo '" + descricaoFormatada + "' já existe nesta classe.");
                });

        TermoVocabulario novoTermo = new TermoVocabulario();
        novoTermo.setDescricao(descricaoFormatada);
        novoTermo.setClasse(classe);
        novoTermo.setAtivo(true);

        termoRepository.persist(novoTermo);
        return novoTermo;
    }

    @Transactional
    public TermoVocabulario atualizarDescricao(Long id, String novaDescricao) {
        TermoVocabulario termo = buscarPorId(id);
        String descricaoFormatada = sanitizarTexto(novaDescricao);

        if (!termo.getDescricao().equalsIgnoreCase(descricaoFormatada)) {
            termoRepository.findByDescricaoAndClasseId(descricaoFormatada, termo.getClasse().getId())
                    .ifPresent(t -> {
                        throw new BadRequestException("Já existe um termo com esta descrição nesta classe.");
                    });
            termo.setDescricao(descricaoFormatada);
        }

        return termo;
    }

    @Transactional
    public void alternarStatus(Long id, boolean ativo) {
        TermoVocabulario termo = buscarPorId(id);

        if (ativo && !termo.getClasse().isAtivo()) {
            throw new BadRequestException("Não é possível ativar um termo de uma classe inativa. Ative a classe primeiro.");
        }

        termo.setAtivo(ativo);
    }

    private String sanitizarTexto(String texto) {
        if (texto == null || texto.isBlank()) {
            throw new BadRequestException("A descrição do termo não pode ser vazia.");
        }
        return texto.trim();
    }
}
