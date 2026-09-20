package com.senai.solicitacao.domain;

import com.senai.common.Auditavel;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidade que armazena os metadados de arquivos técnicos anexados à solicitação.
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 19/09/2026
 */
@Entity
@Table(name = "arquivos_solicitacao")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ArquivoSolicitacao extends Auditavel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "solicitacao_id", nullable = false)
    private Solicitacao solicitacao;

    @Column(name = "nome_original", nullable = false)
    private String nomeOriginal;

    @Column(name = "caminho_relativo", nullable = false)
    private String caminhoRelativo;

    @Column(name = "tipo_mime")
    private String tipoMime;

    @Column(name = "tamanho_bytes", nullable = false)
    private Long tamanhoBytes;

    public ArquivoSolicitacao(Solicitacao solicitacao, String nomeOriginal, String caminhoRelativo, String tipoMime, Long tamanhoBytes) {
        this.solicitacao = solicitacao;
        this.nomeOriginal = nomeOriginal;
        this.caminhoRelativo = caminhoRelativo;
        this.tipoMime = tipoMime;
        this.tamanhoBytes = tamanhoBytes;
    }
}
