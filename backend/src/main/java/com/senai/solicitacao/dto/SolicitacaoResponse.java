package com.senai.solicitacao.dto;

import com.senai.solicitacao.domain.StatusSolicitacao;

import java.time.Instant;
import java.util.List;

/**
 * DTO com os dados completos de uma solicitação de orçamento.
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 19/09/2026
 */
public record SolicitacaoResponse(
        Long id,
        String codigo,
        String nome,
        String empresa,
        String email,
        String telefone,
        String servico,
        String quantidadePecas,
        String mensagem,
        StatusSolicitacao status,
        String observacoesInternas,
        Instant dataCriacao,
        Instant dataAtualizacao,
        List<ArquivoSolicitacaoResponse> arquivos
) {
}
