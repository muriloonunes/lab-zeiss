package com.senai.servico.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BlocoRealizadoResponse(
        Double horasRealizadas,
        BigDecimal custoReal,
        BigDecimal valorFaturado,
        LocalDate dataRealEntrega,
        Boolean houveRetrabalho,
        Boolean houveMudancaEscopo
) {}