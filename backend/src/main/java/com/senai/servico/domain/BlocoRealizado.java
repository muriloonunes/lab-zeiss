package com.senai.servico.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 20/09/2026
 * @brief Class BlocoRealizado
 */
@Embeddable
@Getter
@Setter
public class BlocoRealizado {
    @Column(name = "horas_realizadas")
    private Double horasRealizadas;

    @Column(name = "custo_real", precision = 10, scale = 2)
    private BigDecimal custoReal;

    @Column(name = "valor_faturado", precision = 10, scale = 2)
    private BigDecimal valorFaturado;

    @Column(name = "data_real_entrega")
    private LocalDate dataRealEntrega;

    @Column(name = "retrabalho")
    private Boolean houveRetrabalho;

    @Column(name = "mudanca_escopo")
    private Boolean houveMudancaEscopo;
}
