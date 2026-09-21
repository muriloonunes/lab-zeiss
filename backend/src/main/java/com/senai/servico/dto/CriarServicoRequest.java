package com.senai.servico.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.Set;

public record CriarServicoRequest(
        @NotBlank(message = "O código do serviço é obrigatório.")
        String codigo,

        @NotNull(message = "O tipo de serviço é obrigatório.")
        Long tipoServicoId,

        @NotNull(message = "O recurso é obrigatório.")
        Long recursoId,

        @NotEmpty(message = "Ao menos uma característica da peça deve ser informada.")
        Set<Long> caracteristicasPecaIds,

        @NotNull(message = "As horas estimadas são obrigatórias.")
        @Positive(message = "As horas estimadas devem ser maiores que zero.")
        Double horasEstimadas,

        @NotNull(message = "O custo estimado é obrigatório.")
        @Positive(message = "O custo estimado deve ser positivo.")
        BigDecimal custoEstimado,

        @NotNull(message = "O valor proposto é obrigatório.")
        @Positive(message = "O valor proposto deve ser positivo.")
        BigDecimal valorProposto,

        String premissasAssumidas,
        String justificativaDesvioAssistente
) {}