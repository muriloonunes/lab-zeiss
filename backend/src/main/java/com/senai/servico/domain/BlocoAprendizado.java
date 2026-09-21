package com.senai.servico.domain;

import com.senai.vocabulario.TermoVocabulario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 20/09/2026
 * @brief Class BlocoAprendizado
 */
@Embeddable
@Getter
@Setter
public class BlocoAprendizado {
    @ManyToOne
    @JoinColumn(name = "causa_desvio_id")
    private TermoVocabulario causaDesvio;

    @Column(name = "licao", columnDefinition = "TEXT")
    private String licaoAprendida;

    @ManyToMany
    @JoinTable(
            name = "registro_servico_aprendizado_assuntos",
            joinColumns = @JoinColumn(name = "registro_servico_id"),
            inverseJoinColumns = @JoinColumn(name = "termo_vocabulario_id")
    )
    private Set<TermoVocabulario> assuntosRelacionados;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_licao", length = 20)
    private StatusLicao statusLicao;

    @Column(name = "restrito")
    private Boolean restrito = false;
}
