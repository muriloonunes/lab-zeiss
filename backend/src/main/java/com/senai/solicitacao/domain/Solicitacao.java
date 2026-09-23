package com.senai.solicitacao.domain;

import com.senai.common.Auditavel;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Entidade que representa uma solicitação pública de orçamento ou análise técnica de metrologia.
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 19/09/2026
 */
@Entity
@Table(name = "solicitacoes")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Solicitacao extends Auditavel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo", nullable = false, unique = true, length = 32)
    private String codigo;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "empresa", nullable = false)
    private String empresa;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "telefone", nullable = false)
    private String telefone;

    @Column(name = "servico", nullable = false)
    private String servico;

    @Column(name = "quantidade_pecas")
    private String quantidadePecas;

    @Column(name = "mensagem", length = 4000)
    private String mensagem;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private StatusSolicitacao status = StatusSolicitacao.PENDENTE;

    @Column(name = "observacoes_internas", length = 4000)
    private String observacoesInternas;

    @OneToMany(mappedBy = "solicitacao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ArquivoSolicitacao> arquivos = new ArrayList<>();

    public Solicitacao(String nome, String empresa, String email, String telefone, String servico, String quantidadePecas, String mensagem) {
        this.nome = nome;
        this.empresa = empresa;
        this.email = email;
        this.telefone = telefone;
        this.servico = servico;
        this.quantidadePecas = quantidadePecas;
        this.mensagem = mensagem;
        this.status = StatusSolicitacao.PENDENTE;
    }

    public void adicionarArquivo(ArquivoSolicitacao arquivo) {
        this.arquivos.add(arquivo);
        arquivo.setSolicitacao(this);
    }
}
