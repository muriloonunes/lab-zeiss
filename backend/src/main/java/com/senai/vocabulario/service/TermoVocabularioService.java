package com.senai.vocabulario.service;

import com.senai.common.exception.ConflitoException;
import com.senai.common.exception.NaoEncontradoException;
import com.senai.common.exception.RequisicaoInvalidaException;
import com.senai.vocabulario.ClasseVocabulario;
import com.senai.vocabulario.TermoVocabulario;
import com.senai.vocabulario.VocabularioMapper;
import com.senai.vocabulario.dto.TermoResponse;
import com.senai.vocabulario.repository.TermoVocabularioRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

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

    @Inject
    VocabularioMapper mapper;

    public List<TermoResponse> listarAtivosPorClasse(Long classeId) {
        var ativos = termoRepository.listActiveByClasseId(classeId);
        return mapper.toTermoResponseList(ativos);
    }

    public List<TermoResponse> listarAtivosOuAssinadosPorClasse(Long classeId, Long usuarioId) {
        var termos = termoRepository.listActiveOrAssinadoByUsuarioAndClasseId(classeId, usuarioId);
        return mapper.toTermoResponseList(termos);
    }

    public List<TermoResponse> listarAtivosPorNomeClasse(String nomeClasse) {
        var termos = termoRepository.listActiveByClasseNome(nomeClasse);
        return mapper.toTermoResponseList(termos);
    }

    public List<TermoResponse> listarTodosPorClasse(Long classeId) {
        var todos = termoRepository.list("classe.id = ?1 order by id desc", classeId);
        return mapper.toTermoResponseList(todos);
    }

    public TermoResponse buscarPorId(Long id) {
        var termo = termoRepository.findByIdOptional(id)
                .orElseThrow(() -> new NaoEncontradoException("Termo de vocabulário não encontrado."));
        return mapper.toResponse(termo);
    }

    private TermoVocabulario buscarEntityPorId(Long id) {
        return termoRepository.findByIdOptional(id)
                .orElseThrow(() -> new NaoEncontradoException("Termo de vocabulário não encontrado."));
    }

    @Transactional
    public TermoResponse criar(Long classeId, String descricao) {
        ClasseVocabulario classe = classeService.buscarEntityPorId(classeId);

        if (!classe.isAtivo()) {
            throw new RequisicaoInvalidaException("Não é possível associar novos termos a uma classe inativa.");
        }

        String descricaoFormatada = sanitizarTexto(descricao);

        termoRepository.findByDescricaoAndClasseId(descricaoFormatada, classeId)
                .ifPresent(existente -> {
                    throw new ConflitoException("O termo '" + descricaoFormatada + "' já existe nesta classe.");
                });

        TermoVocabulario novoTermo = new TermoVocabulario();
        novoTermo.setDescricao(descricaoFormatada);
        novoTermo.setClasse(classe);
        novoTermo.setAtivo(true);

        termoRepository.persist(novoTermo);
        return mapper.toResponse(novoTermo);
    }

    @Transactional
    public TermoResponse atualizar(Long id, String novaDescricao) {
        TermoVocabulario termo = buscarEntityPorId(id);

        if (!termo.isAtivo()) {
            throw new RequisicaoInvalidaException("Não é possível editar a descrição de um termo inativo. Reative o termo primeiro.");
        }

        String descricaoFormatada = sanitizarTexto(novaDescricao);

        if (!termo.getDescricao().equalsIgnoreCase(descricaoFormatada)) {
            termoRepository.findByDescricaoAndClasseId(descricaoFormatada, termo.getClasse().getId())
                    .ifPresent(t -> {
                        throw new ConflitoException("Já existe um termo com esta descrição nesta classe.");
                    });
            termo.setDescricao(descricaoFormatada);
        }

        return mapper.toResponse(termo);
    }

    @Transactional
    public void alternarStatus(Long id, boolean ativo) {
        TermoVocabulario termo = buscarEntityPorId(id);

        if (ativo && !termo.getClasse().isAtivo()) {
            throw new RequisicaoInvalidaException("Não é possível ativar um termo de uma classe inativa. Ative a classe primeiro.");
        }

        termo.setAtivo(ativo);
    }

    private String sanitizarTexto(String texto) {
        if (texto == null || texto.isBlank()) {
            throw new RequisicaoInvalidaException("A descrição do termo não pode ser vazia.");
        }
        return texto.trim();
    }
}
