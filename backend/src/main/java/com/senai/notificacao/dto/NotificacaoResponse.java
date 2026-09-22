package com.senai.notificacao.dto;

import java.time.LocalDateTime;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 22/09/2026
 * @brief DTO NotificacaoResponse
 */
public record NotificacaoResponse(
        Long id,
        Long usuarioId,
        String titulo,
        String mensagem,
        boolean lida,
        LocalDateTime dataCriacao
) {
}
