package com.senai.solicitacao.dto;

import com.senai.solicitacao.domain.StatusSolicitacao;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para atualização do status e anotações internas da equipe técnica.
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 19/09/2026
 */
public record AtualizarStatusSolicitacaoRequest(
        @NotNull(message = "O status é obrigatório.")
        StatusSolicitacao status,
        String observacoesInternas
) {
}
