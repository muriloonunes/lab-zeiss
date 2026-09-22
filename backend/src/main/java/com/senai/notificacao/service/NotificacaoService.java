package com.senai.notificacao.service;

import com.senai.notificacao.NotificacaoMapper;
import com.senai.notificacao.repository.NotificacaoRepository;
import com.senai.notificacao.dto.ContagemNaoLidasResponse;
import com.senai.notificacao.dto.NotificacaoResponse;
import com.senai.common.exception.NaoEncontradoException;
import com.senai.notificacao.domain.Notificacao;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 22/09/2026
 * @brief Class NotificacaoService
 */
@ApplicationScoped
public class NotificacaoService {

    @Inject
    NotificacaoRepository notificacaoRepository;

    @Inject
    NotificacaoMapper mapper;

    public List<NotificacaoResponse> listarPorUsuario(Long usuarioId) {
        return notificacaoRepository.listarPorUsuario(usuarioId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public ContagemNaoLidasResponse contarNaoLidas(Long usuarioId) {
        long total = notificacaoRepository.contarNaoLidasPorUsuario(usuarioId);
        return new ContagemNaoLidasResponse(total);
    }

    @Transactional
    public NotificacaoResponse marcarComoLida(Long id, Long usuarioId) {
        Notificacao notif = notificacaoRepository.buscarPorIdEUsuario(id, usuarioId)
                .orElseThrow(() -> new NaoEncontradoException("Notificação não encontrada."));

        notif.setLida(true);
        notificacaoRepository.persist(notif);
        return mapper.toResponse(notif);
    }

    @Transactional
    public void marcarTodasComoLidas(Long usuarioId) {
        notificacaoRepository.marcarTodasComoLidas(usuarioId);
    }

    @Transactional
    public void excluirNotificacao(Long id, Long usuarioId) {
        long deleted = notificacaoRepository.deletarPorIdEUsuario(id, usuarioId);
        if (deleted == 0) {
            throw new NaoEncontradoException("Notificação não encontrada ou não pertence ao usuário.");
        }
    }

    @Transactional
    public Notificacao criarNotificacao(Long usuarioId, String titulo, String mensagem) {
        Notificacao notif = new Notificacao();
        notif.setUsuarioId(usuarioId);
        notif.setTitulo(titulo);
        notif.setMensagem(mensagem);
        notif.setLida(false);
        notif.setDataCriacao(LocalDateTime.now());
        notificacaoRepository.persist(notif);
        return notif;
    }
}
