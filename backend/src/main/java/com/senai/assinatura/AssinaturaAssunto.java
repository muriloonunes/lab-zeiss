package com.senai.assinatura;

import com.senai.vocabulario.TermoVocabulario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 19/09/2026
 * @brief Class AssinaturaAssunto
 */
@Entity
@Table(name = "assinatura_assunto", uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "termo_id"}))
@Getter
@Setter
@NoArgsConstructor
public class AssinaturaAssunto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id")
    private Long usuarioId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "termo_id")
    private TermoVocabulario termo;
}
