package com.senai.vocabulario.service;

import com.senai.vocabulario.ClasseVocabulario;
import com.senai.vocabulario.VocabularioMapper;
import com.senai.vocabulario.dto.ClasseResponse;
import com.senai.vocabulario.repository.ClasseVocabularioRepository;
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
 * @brief Class ClasseVocabularioService
 */
@ApplicationScoped
public class ClasseVocabularioService {
    @Inject
    ClasseVocabularioRepository classeRepository;

    @Inject
    TermoVocabularioRepository termoRepository;

    @Inject
    VocabularioMapper mapper;

    public List<ClasseResponse> listarAtivas() {
        var ativas = classeRepository.findAllAtivo();
        return mapper.toClasseResponseList(ativas);
    }

    public List<ClasseResponse> listarTodas() {
        var classes = classeRepository.list("order by nome asc");
        return mapper.toClasseResponseList(classes);
    }

    public ClasseResponse buscarPorId(Long id) {
        var classe = classeRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Classe de vocabulário não encontrada."));
        return mapper.toResponse(classe);
    }

    public ClasseVocabulario buscarEntityPorId(Long id) {
        return classeRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Classe de vocabulário não encontrada."));
    }

    @Transactional
    public ClasseResponse criar(String nome, boolean isClasseBase) {
        String nomeFormatado = sanitizarTexto(nome);

        if (classeRepository.existsByNome(nomeFormatado)) {
            throw new BadRequestException("Já existe uma classe de vocabulário cadastrada com este nome: " + nomeFormatado);
        }

        ClasseVocabulario novaClasse = new ClasseVocabulario();
        novaClasse.setNome(nomeFormatado);
        novaClasse.setAtivo(true);
        novaClasse.setClasseBase(isClasseBase);

        classeRepository.persist(novaClasse);
        return mapper.toResponse(novaClasse);
    }

    @Transactional
    public ClasseResponse atualizarNome(Long id, String novoNome) {
        ClasseVocabulario classe = buscarEntityPorId(id);
        String nomeFormatado = sanitizarTexto(novoNome);

        if (!classe.getNome().equalsIgnoreCase(nomeFormatado) && classeRepository.existsByNome(nomeFormatado)) {
            throw new BadRequestException("Já existe outra classe com o nome: " + nomeFormatado);
        }

        if (classe.isClasseBase()) {
            throw new BadRequestException("Classes-base do sistema não podem ter o nome alterado.");
        }

        classe.setNome(nomeFormatado);
        return mapper.toResponse(classe);
    }

    @Transactional
    public void alternarStatus(Long id, boolean ativo) {
        ClasseVocabulario classe = buscarEntityPorId(id);

        if (!ativo && classe.isClasseBase()) {
            throw new BadRequestException("Classes-base do sistema não podem ser desativadas.");
        }

        classe.setAtivo(ativo);

        if (!ativo) {
            termoRepository.update("ativo = false where classe.id = ?1", id);
        }
    }

    private String sanitizarTexto(String texto) {
        if (texto == null || texto.isBlank()) {
            throw new BadRequestException("O nome da classe não pode ser vazio.");
        }
        return texto.trim();
    }
}
