package com.senai.servico.dto;

import com.senai.servico.domain.StatusServico;

import java.time.Instant;

public record ServicoResponse(
        Long id,
        String codigo,
        StatusServico status,
        String motivoCancelamento,
        Instant dataCriacao,
        Instant dataAtualizacao,
        BlocoOrcamentoResponse blocoOrcamento,
        BlocoRealizadoResponse blocoRealizado,
        BlocoAprendizadoResponse blocoAprendizado
) {}
