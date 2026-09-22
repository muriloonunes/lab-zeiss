package com.senai.licao.service;

import com.senai.assinatura.AssinaturaAssunto;
import com.senai.assinatura.AssinaturaRepository;
import com.senai.common.exception.NaoEncontradoException;
import com.senai.common.exception.RequisicaoInvalidaException;
import com.senai.licao.dto.DevolverLicaoRequest;
import com.senai.licao.dto.ReenviarLicaoRequest;
import com.senai.notificacao.service.NotificacaoService;
import com.senai.servico.ServicoMapper;
import com.senai.servico.domain.BlocoAprendizado;
import com.senai.servico.domain.RegistroServico;
import com.senai.servico.domain.StatusLicao;
import com.senai.servico.domain.StatusServico;
import com.senai.servico.dto.ServicoResponse;
import com.senai.servico.repository.ServicoRepository;
import com.senai.usuario.TipoUsuario;
import com.senai.usuario.Usuario;
import com.senai.usuario.UsuarioRepository;
import com.senai.vocabulario.TermoVocabulario;
import com.senai.vocabulario.repository.TermoVocabularioRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.*;

/**
 * Serviço responsável pelas regras de negócio de Gestão do Conhecimento
 * e ciclo de validação de Lições Aprendidas (Peça 4.6).
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 22/09/2026
 */
@ApplicationScoped
public class LicaoService {

    @Inject
    ServicoRepository servicoRepository;

    @Inject
    TermoVocabularioRepository termoRepository;

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    AssinaturaRepository assinaturaRepository;

    @Inject
    NotificacaoService notificacaoService;

    @Inject
    ServicoMapper mapper;

    public TermoVocabulario validarECarregarCausaDesvio(Long causaDesvioId, boolean obrigatorio) {
        if (causaDesvioId == null) {
            if (obrigatorio) {
                throw new RequisicaoInvalidaException("A causa do desvio é obrigatória.");
            }
            return null;
        }
        var causaDesvio = termoRepository.findByIdOptional(causaDesvioId)
                .orElseThrow(() -> new NaoEncontradoException("Causa de desvio informada não existe."));

        if (!causaDesvio.getClasse().getNome().equalsIgnoreCase("Causa do Desvio") || !causaDesvio.isAtivo()) {
            throw new RequisicaoInvalidaException("Termo inválido ou inativo para Causa do Desvio.");
        }
        return causaDesvio;
    }

    public Set<TermoVocabulario> validarECarregarAssuntosRelacionados(Collection<Long> assuntosRelacionadosIds) {
        if (assuntosRelacionadosIds == null || assuntosRelacionadosIds.isEmpty()) {
            return new HashSet<>();
        }
        Set<TermoVocabulario> assuntosRelacionados = new HashSet<>();
        for (Long assuntoId : assuntosRelacionadosIds) {
            var assunto = termoRepository.findByIdOptional(assuntoId)
                    .orElseThrow(() -> new NaoEncontradoException("Assunto relacionado ID " + assuntoId + " não encontrado."));
            if (!assunto.isAtivo()) {
                throw new RequisicaoInvalidaException("O termo '" + assunto.getDescricao() + "' está inativo.");
            }
            assuntosRelacionados.add(assunto);
        }
        return assuntosRelacionados;
    }

    public BlocoAprendizado montarBlocoAprendizado(
            BlocoAprendizado blocoExistente,
            Long causaDesvioId,
            String licaoAprendida,
            Collection<Long> assuntosRelacionadosIds,
            Boolean restrito,
            StatusLicao statusLicao,
            String motivoRejeicao,
            boolean obrigatorio
    ) {
        var bloco = blocoExistente != null ? blocoExistente : new BlocoAprendizado();
        if (causaDesvioId != null || obrigatorio) {
            bloco.setCausaDesvio(validarECarregarCausaDesvio(causaDesvioId, obrigatorio));
        }
        if (assuntosRelacionadosIds != null) {
            bloco.setAssuntosRelacionados(validarECarregarAssuntosRelacionados(assuntosRelacionadosIds));
        }
        if (licaoAprendida != null) {
            bloco.setLicaoAprendida(licaoAprendida.trim());
        }
        if (restrito != null) {
            bloco.setRestrito(restrito);
        }
        if (statusLicao != null) {
            bloco.setStatusLicao(statusLicao);
        }
        bloco.setMotivoRejeicao(motivoRejeicao);
        return bloco;
    }

    public void notificarNovaLicao(RegistroServico servico, boolean isReenvio) {
        List<Usuario> validadores = usuarioRepository.listarAtivosPorTipos(TipoUsuario.VALIDADOR, TipoUsuario.ADMINISTRADOR);
        Long autorId = servico.getBlocoOrcamento() != null && servico.getBlocoOrcamento().getResponsavelEstimativa() != null
                ? servico.getBlocoOrcamento().getResponsavelEstimativa().getId()
                : null;

        String titulo = isReenvio
                ? "Lição Reenviada para Validação: " + servico.getCodigo()
                : "Nova Lição para Validação: " + servico.getCodigo();

        String mensagem = isReenvio
                ? String.format("A lição da OS %s foi revisada e reenviada pelo técnico para validação do conhecimento.", servico.getCodigo())
                : String.format("A OS %s foi finalizada e submeteu uma nova lição aprendida aguardando validação.", servico.getCodigo());

        for (Usuario validador : validadores) {
            if (validador.getId().equals(autorId)) {
                continue;
            }
            notificacaoService.criarNotificacao(validador.getId(), titulo, mensagem);
        }
    }

    @Transactional
    public ServicoResponse reenviarLicao(Long servicoId, ReenviarLicaoRequest request) {
        var servico = servicoRepository.findByIdOptional(servicoId)
                .orElseThrow(() -> new NaoEncontradoException("Serviço não encontrado"));

        if (servico.getStatus() != StatusServico.CONCLUIDO) {
            throw new RequisicaoInvalidaException("A lição só pode ser reenviada para serviços concluídos.");
        }

        var blocoAprendizado = montarBlocoAprendizado(
                servico.getBlocoAprendizado(),
                request.causaDesvioId(),
                request.licaoAprendida(),
                request.assuntosRelacionadosIds(),
                request.restrito(),
                StatusLicao.EM_VALIDACAO,
                null,
                true
        );

        servico.setBlocoAprendizado(blocoAprendizado);
        servicoRepository.persist(servico);

        // Notificar validadores sobre o reenvio
        notificarNovaLicao(servico, true);

        return mapper.toResponse(servico);
    }

    @Transactional
    public ServicoResponse aprovarLicao(Long servicoId, Long validadorId) {
        var servico = servicoRepository.findByIdOptional(servicoId)
                .orElseThrow(() -> new NaoEncontradoException("Serviço não encontrado"));

        if (servico.getStatus() != StatusServico.CONCLUIDO) {
            throw new RequisicaoInvalidaException("Apenas serviços concluídos possuem lições para validação.");
        }

        var blocoAprendizado = servico.getBlocoAprendizado();
        if (blocoAprendizado == null || blocoAprendizado.getStatusLicao() != StatusLicao.EM_VALIDACAO) {
            throw new RequisicaoInvalidaException("A lição deste serviço não está pendente de validação.");
        }

        blocoAprendizado.setStatusLicao(StatusLicao.FORMALIZADA);
        blocoAprendizado.setMotivoRejeicao(null);
        servicoRepository.persist(servico);

        // Notificar técnico responsável pela estimativa
        var autorEstimativa = servico.getBlocoOrcamento() != null ? servico.getBlocoOrcamento().getResponsavelEstimativa() : null;
        if (autorEstimativa != null && (!autorEstimativa.getId().equals(validadorId))) {
            notificacaoService.criarNotificacao(
                    autorEstimativa.getId(),
                    "Lição Aprovada: " + servico.getCodigo(),
                    "A lição aprendida registrada na OS " + servico.getCodigo() + " foi aprovada e formalizada pelo validador."
            );
        }

        // Notificar assinantes dos assuntos relacionados
        var assuntos = blocoAprendizado.getAssuntosRelacionados();
        if (assuntos != null && !assuntos.isEmpty()) {
            List<Long> termosIds = assuntos.stream().map(TermoVocabulario::getId).toList();
            List<AssinaturaAssunto> assinaturas = assinaturaRepository.listarPorTermos(termosIds);

            Map<Long, List<String>> assuntosPorUsuario = new HashMap<>();
            for (AssinaturaAssunto ass : assinaturas) {
                Long usuarioAssinanteId = ass.getUsuarioId();
                if (usuarioAssinanteId.equals(validadorId)) {
                    continue;
                }
                assuntosPorUsuario.computeIfAbsent(usuarioAssinanteId, k -> new ArrayList<>())
                        .add(ass.getTermo().getDescricao());
            }

            for (Map.Entry<Long, List<String>> entry : assuntosPorUsuario.entrySet()) {
                Long usuarioDestinoId = entry.getKey();
                if (autorEstimativa != null && usuarioDestinoId.equals(autorEstimativa.getId())) {
                    continue;
                }
                String listaAssuntos = String.join(", ", entry.getValue().stream().distinct().toList());
                String msg = String.format(
                        "Uma nova lição aprendida foi formalizada na OS %s referente aos assuntos que você acompanha (%s).\n\nLição Registrada:\n\"%s\"",
                        servico.getCodigo(),
                        listaAssuntos,
                        blocoAprendizado.getLicaoAprendida() != null ? blocoAprendizado.getLicaoAprendida() : "Sem relato detalhado."
                );
                notificacaoService.criarNotificacao(
                        usuarioDestinoId,
                        "Novo Conhecimento Formalizado: " + servico.getCodigo(),
                        msg
                );
            }
        }

        return mapper.toResponse(servico);
    }

    @Transactional
    public ServicoResponse devolverLicao(Long servicoId, DevolverLicaoRequest request) {
        var servico = servicoRepository.findByIdOptional(servicoId)
                .orElseThrow(() -> new NaoEncontradoException("Serviço não encontrado"));

        if (servico.getStatus() != StatusServico.CONCLUIDO) {
            throw new RequisicaoInvalidaException("Apenas serviços concluídos podem ter lições devolvidas.");
        }

        var blocoAprendizado = servico.getBlocoAprendizado();
        if (blocoAprendizado == null || blocoAprendizado.getStatusLicao() != StatusLicao.EM_VALIDACAO) {
            throw new RequisicaoInvalidaException("A lição deste serviço não está em estado de validação.");
        }

        if (request.motivoRejeicao() == null || request.motivoRejeicao().trim().isBlank()) {
            throw new RequisicaoInvalidaException("O motivo da devolução/rejeição é obrigatório.");
        }

        String motivo = request.motivoRejeicao().trim();
        blocoAprendizado.setStatusLicao(StatusLicao.RASCUNHO);
        blocoAprendizado.setMotivoRejeicao(motivo);
        servicoRepository.persist(servico);

        // Notificar técnico responsável
        var autor = servico.getBlocoOrcamento() != null ? servico.getBlocoOrcamento().getResponsavelEstimativa() : null;
        if (autor != null) {
            String msg = String.format(
                    "A lição aprendida da OS %s foi devolvida pelo validador para revisão/complementação.\n\nMotivo da Devolução:\n%s",
                    servico.getCodigo(),
                    motivo
            );
            notificacaoService.criarNotificacao(
                    autor.getId(),
                    "Lição Devolvida: " + servico.getCodigo(),
                    msg
            );
        }

        return mapper.toResponse(servico);
    }
}
