package com.senai.solicitacao.dto;

import java.time.Instant;

/**
 * DTO com os dados de um arquivo anexado à solicitação.
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 19/09/2026
 */
public record ArquivoSolicitacaoResponse(
        Long id,
        String nomeOriginal,
        String tipoMime,
        Long tamanhoBytes,
        Instant dataCriacao
) {
}
