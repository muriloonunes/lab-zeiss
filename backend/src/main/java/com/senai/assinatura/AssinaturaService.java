package com.senai.assinatura;

import com.senai.common.exception.NaoEncontradoException;
import com.senai.vocabulario.TermoVocabulario;
import com.senai.vocabulario.repository.TermoVocabularioRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;

import java.util.List;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 19/09/2026
 * @brief Class AssinaturaService
 */
@ApplicationScoped
public class AssinaturaService {
    @Inject
    AssinaturaRepository assinaturaRepository;

    @Inject
    TermoVocabularioRepository termoRepository;

    public List<Long> listarIdsTermosAssinados(Long usuarioId) {
        return assinaturaRepository.listarPorUsuario(usuarioId).stream()
                .map(a -> a.getTermo().getId())
                .toList();
    }

    @Transactional
    public void assinar(Long usuarioId, Long termoId) {
        if (assinaturaRepository.listarPorUsuarioETermo(usuarioId, termoId).isPresent()) {
            return;
        }

        TermoVocabulario termo = termoRepository.findByIdOptional(termoId)
                .orElseThrow(() -> new NaoEncontradoException("Termo não encontrado"));

        if (!termo.isAtivo()) {
            throw new BadRequestException("Não é possível assinar um termo inativo.");
        }

        AssinaturaAssunto assinatura = new AssinaturaAssunto();
        assinatura.setUsuarioId(usuarioId);
        assinatura.setTermo(termo);
        assinaturaRepository.persist(assinatura);
    }

    @Transactional
    public void desassinar(Long usuarioId, Long termoId) {
        assinaturaRepository.deleteByUsuarioETermo(usuarioId, termoId);
    }
}
