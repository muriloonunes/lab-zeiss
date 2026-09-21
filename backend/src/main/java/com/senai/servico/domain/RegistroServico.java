package com.senai.servico.domain;

import com.senai.common.Auditavel;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 20/09/2026
 * @brief Class RegistroServico
 */
@Entity
@Table(name = "registro_servico")
@Getter
@Setter
@NoArgsConstructor
public class RegistroServico extends Auditavel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo", nullable = false, unique = true, length = 32)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusServico status = StatusServico.ORCADO;

    @Embedded
    private BlocoOrcamento blocoOrcamento;

    @Embedded
    private BlocoRealizado blocoRealizado;

    @Embedded
    private BlocoAprendizado blocoAprendizado;
}
