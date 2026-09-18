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
 * @brief Class ClasseVocabulario
 */

@Entity
@Table(name = "classe_vocabulario", uniqueConstraints = @UniqueConstraint(columnNames = {"nome"}))
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PUBLIC)
public class ClasseVocabulario extends Auditavel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String nome;

    @Column(nullable = false)
    private boolean ativo;

    @Column(nullable = false)
    private boolean classeBase = false;
}
