package com.senai.servico.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

public record ConcluirServicoRequest(
        @NotNull(message = "As horas realizadas são obrigatórias.")
        @Positive(message = "As horas realizadas devem ser positivas.")
        Double horasRealizadas,

        @NotNull(message = "O custo real é obrigatório.")
        @Positive(message = "O custo real deve ser positivo.")
        BigDecimal custoReal,

        @NotNull(message = "O valor faturado é obrigatório.")
        @Positive(message = "O valor faturado deve ser positivo.")
        BigDecimal valorFaturado,

        @NotNull(message = "A data real de entrega é obrigatória.")
        LocalDate dataRealEntrega,

        boolean houveRetrabalho,
        boolean houveMudancaEscopo,

        @NotNull(message = "A causa de desvio é obrigatória.")
        Long causaDesvioId,

        String licaoAprendida,

        Set<Long> assuntosRelacionadosIds,

        @NotNull(message = "A indicação de restrição é obrigatória.")
        Boolean restrito
) {
}