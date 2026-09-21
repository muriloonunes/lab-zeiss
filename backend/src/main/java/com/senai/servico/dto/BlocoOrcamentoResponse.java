package com.senai.servico.dto;

import com.senai.usuario.dto.UsuarioResponse;
import com.senai.vocabulario.dto.TermoResponse;

import java.math.BigDecimal;
import java.util.Set;

public record BlocoOrcamentoResponse(
        TermoResponse tipoServico,
        Set<TermoResponse> caracteristicasPeca,
        TermoResponse recurso,
        Double horasEstimadas,
        BigDecimal custoEstimado,
        BigDecimal valorProposto,
        UsuarioResponse responsavelEstimativa,
        String premissasAssumidas,
        String justificativaDesvioAssistente
) {}
