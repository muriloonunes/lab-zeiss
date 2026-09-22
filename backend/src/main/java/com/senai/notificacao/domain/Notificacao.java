package com.senai.notificacao.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 19/09/2026
 * @brief Class NotificacaoAssinatura
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "notificacoes")
public class Notificacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String mensagem;

    @Column(nullable = false)
    private boolean lida = false;

    @Column(nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();
}
