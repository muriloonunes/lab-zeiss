package com.senai.vocabulario;

import com.senai.common.Auditavel;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 18/09/2026
 * @brief Class TipoVocabulario
 */

@Entity
@Table(name = "termo_vocabulario", uniqueConstraints = @UniqueConstraint(columnNames = {"descricao"}))
@Getter
@Setter
@NoArgsConstructor
public class TermoVocabulario extends Auditavel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String descricao;

    @ManyToOne(optional = false)
    @JoinColumn(name = "classe_id", nullable = false)
    private ClasseVocabulario classe;

    private boolean ativo = true;
}
