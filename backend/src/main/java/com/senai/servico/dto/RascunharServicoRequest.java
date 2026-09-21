package com.senai.servico.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

public record RascunharServicoRequest(
        Double horasRealizadas,
        BigDecimal custoReal,
        BigDecimal valorFaturado,
        LocalDate dataRealEntrega,
        boolean houveRetrabalho,
        boolean houveMudancaEscopo,
        Long causaDesvioId,
        String licaoAprendida,
        Set<Long> assuntosRelacionadosIds,
        Boolean restrito
) {
}
