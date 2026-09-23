package com.senai.servico.domain;

import com.senai.usuario.Usuario;
import com.senai.vocabulario.TermoVocabulario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 20/09/2026
 * @brief Class BlocoOrcamento
 */
@Embeddable
@Getter
@Setter
public class BlocoOrcamento {
    @ManyToOne(optional = false)
    @JoinColumn(name = "tipo_servico_id", nullable = false)
    private TermoVocabulario tipoServico;

    @ManyToMany
    @JoinTable(
            name = "registro_servico_caracteristicas_peca",
            joinColumns = @JoinColumn(name = "registro_servico_id"),
            inverseJoinColumns = @JoinColumn(name = "termo_vocabulario_id")
    )
    private Set<TermoVocabulario> caracteristicasPeca = new HashSet<>();

    @ManyToOne(optional = false)
    @JoinColumn(name = "recurso_id", nullable = false)
    private TermoVocabulario recurso;

    @Column(name = "horas_estimadas", nullable = false)
    private Double horasEstimadas;

    @Column(name = "custo_estimado", nullable = false, precision = 10, scale = 2)
    private BigDecimal custoEstimado;

    @Column(name = "valor_proposto", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorProposto;

    @ManyToOne(optional = false)
    @JoinColumn(name = "responsavel_estimativa_id", nullable = false)
    private Usuario responsavelEstimativa;

    @Column(name = "premissas_assumidas", columnDefinition = "TEXT")
    private String premissasAssumidas;

    @Column(name = "justificativa_desvio_assistente", columnDefinition = "TEXT")
    private String justificativaDesvioAssistente;
}
