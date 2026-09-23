package com.senai.licao.service;

import com.senai.assinatura.AssinaturaAssunto;
import com.senai.assinatura.AssinaturaRepository;
import com.senai.common.exception.NaoEncontradoException;
import com.senai.common.exception.RequisicaoInvalidaException;
import com.senai.licao.dto.ContagemPendentesResponse;
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
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 22/09/2026
 * @brief Service dedicado para o ciclo de vida e gestão de Lições Aprendidas (SRP)
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
    NotificacaoService notificacaoService;

    @Inject
    AssinaturaRepository assinaturaRepository;

    @Inject
    ServicoMapper mapper;

    public List<ServicoResponse> listarBaseConhecimento(StatusLicao status, Long termoId, String busca) {
        return servicoRepository.listarBaseConhecimento(status, termoId, busca).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<ServicoResponse> listarLicoesPendentesValidacao() {
        return servicoRepository.listarLicoesPendentesValidacao().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public ContagemPendentesResponse contarLicoesPendentesValidacao() {
        long total = servicoRepository.contarLicoesPendentesValidacao();
        return new ContagemPendentesResponse(total);
    }

    public TermoVocabulario validarECarregarCausaDesvio(Long causaDesvioId) {
        if (causaDesvioId == null) {
            return null;
        }
        var termo = termoRepository.findByIdOptional(causaDesvioId)
                .orElseThrow(() -> new NaoEncontradoException("Causa de desvio informada não existe."));

        if (!termo.isAtivo()) {
            throw new RequisicaoInvalidaException("O termo de causa de desvio selecionado está inativo.");
        }
        String nomeClasse = termo.getClasse() != null ? termo.getClasse().getNome() : "";
        if (!"Causa do Desvio".equalsIgnoreCase(nomeClasse) && !"Causa de Desvio".equalsIgnoreCase(nomeClasse)) {
            throw new RequisicaoInvalidaException("Termo inválido ou inativo para Causa do Desvio.");
        }
        return termo;
    }

    public Set<TermoVocabulario> validarECarregarAssuntosRelacionados(Collection<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new LinkedHashSet<>();
        }
        Set<TermoVocabulario> termos = new LinkedHashSet<>();
        for (Long id : ids) {
            var termo = termoRepository.findByIdOptional(id)
                    .orElseThrow(() -> new NaoEncontradoException("Assunto relacionado ID " + id + " não encontrado."));
            if (!termo.isAtivo()) {
                throw new RequisicaoInvalidaException("O termo '" + termo.getDescricao() + "' está inativo.");
            }
            termos.add(termo);
        }
        return termos;
    }

    public BlocoAprendizado montarBlocoAprendizado(
            BlocoAprendizado existente,
            Long causaDesvioId,
            String licaoAprendida,
            Collection<Long> assuntosRelacionadosIds,
            Boolean restrito,
            StatusLicao novoStatus,
            String novoMotivoRejeicao,
            boolean isConclusao
    ) {
        BlocoAprendizado bloco = existente != null ? existente : new BlocoAprendizado();

        if (isConclusao) {
            if (causaDesvioId == null) {
                throw new RequisicaoInvalidaException("A causa de desvio é obrigatória para concluir o serviço.");
            }
            bloco.setCausaDesvio(validarECarregarCausaDesvio(causaDesvioId));

            if (licaoAprendida == null || licaoAprendida.trim().isBlank()) {
                throw new RequisicaoInvalidaException("O relato da lição aprendida é obrigatório para concluir o serviço.");
            }
            bloco.setLicaoAprendida(licaoAprendida.trim());

            if (assuntosRelacionadosIds != null) {
                bloco.setAssuntosRelacionados(validarECarregarAssuntosRelacionados(assuntosRelacionadosIds));
            } else {
                bloco.setAssuntosRelacionados(new LinkedHashSet<>());
            }

            bloco.setRestrito(Boolean.TRUE.equals(restrito));
            bloco.setStatusLicao(StatusLicao.EM_VALIDACAO);
            bloco.setMotivoRejeicao(null);
        } else {
            if (causaDesvioId != null) {
                bloco.setCausaDesvio(validarECarregarCausaDesvio(causaDesvioId));
            } else {
                bloco.setCausaDesvio(null);
            }

            bloco.setLicaoAprendida(licaoAprendida != null && !licaoAprendida.trim().isBlank() ? licaoAprendida.trim() : null);

            if (assuntosRelacionadosIds != null && !assuntosRelacionadosIds.isEmpty()) {
                bloco.setAssuntosRelacionados(validarECarregarAssuntosRelacionados(assuntosRelacionadosIds));
            } else {
                bloco.setAssuntosRelacionados(new LinkedHashSet<>());
            }

            bloco.setRestrito(Boolean.TRUE.equals(restrito));

            if (novoStatus != null) {
                bloco.setStatusLicao(novoStatus);
            } else if (bloco.getStatusLicao() == null || bloco.getStatusLicao() == StatusLicao.RASCUNHO) {
                bloco.setStatusLicao(StatusLicao.RASCUNHO);
            }

            if (novoMotivoRejeicao != null) {
                bloco.setMotivoRejeicao(novoMotivoRejeicao);
            }
        }

        return bloco;
    }

    public void notificarNovaLicao(RegistroServico servico, boolean isReenvio) {
        List<Usuario> validadores = usuarioRepository.listarAtivosPorTipos(TipoUsuario.VALIDADOR, TipoUsuario.ADMINISTRADOR);
        String acao = isReenvio ? "revisada e reenviada" : "concluída";
        String titulo = isReenvio ? "Lição Reenviada: " + servico.getCodigo() : "Nova Lição para Validação: " + servico.getCodigo();
        String link = "/interno/licoes?aba=validacao&servicoId=" + servico.getId();

        for (Usuario validador : validadores) {
            String mensagem = String.format(
                    "A ordem de serviço %s teve sua lição %s pelo técnico e aguarda validação técnica no laboratório.",
                    servico.getCodigo(),
                    acao
            );
            notificacaoService.criarNotificacao(
                    validador.getId(),
                    titulo,
                    mensagem,
                    "LICAO_PENDENTE_VALIDACAO",
                    servico.getId(),
                    link
            );
        }
    }

    @Transactional
    public ServicoResponse reenviarLicao(Long servicoId, ReenviarLicaoRequest request) {
        var servico = servicoRepository.findByIdOptional(servicoId)
                .orElseThrow(() -> new NaoEncontradoException("Serviço não encontrado"));

        if (servico.getStatus() != StatusServico.CONCLUIDO) {
            throw new RequisicaoInvalidaException("Apenas serviços com status CONCLUIDO podem ter suas lições reenviadas.");
        }

        var blocoAprendizado = servico.getBlocoAprendizado();
        if (blocoAprendizado == null) {
            throw new RequisicaoInvalidaException("Este serviço não possui lição aprendida registrada.");
        }

        if (blocoAprendizado.getStatusLicao() != StatusLicao.RASCUNHO) {
            throw new RequisicaoInvalidaException("Apenas lições devolvidas (status RASCUNHO) podem ser reenviadas para validação.");
        }

        if (request.licaoAprendida() == null || request.licaoAprendida().isBlank()) {
            throw new RequisicaoInvalidaException("O relato da lição aprendida é obrigatório.");
        }

        if (request.causaDesvioId() != null) {
            blocoAprendizado.setCausaDesvio(validarECarregarCausaDesvio(request.causaDesvioId()));
        }

        if (request.assuntosRelacionadosIds() != null) {
            blocoAprendizado.setAssuntosRelacionados(validarECarregarAssuntosRelacionados(request.assuntosRelacionadosIds()));
        }

        blocoAprendizado.setLicaoAprendida(request.licaoAprendida().trim());
        blocoAprendizado.setRestrito(request.restrito());

        blocoAprendizado.setStatusLicao(StatusLicao.EM_VALIDACAO);
        blocoAprendizado.setMotivoRejeicao(null);

        servicoRepository.persist(servico);

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

        var autorEstimativa = servico.getBlocoOrcamento() != null ? servico.getBlocoOrcamento().getResponsavelEstimativa() : null;
        if (autorEstimativa != null && (!autorEstimativa.getId().equals(validadorId))) {
            notificacaoService.criarNotificacao(
                    autorEstimativa.getId(),
                    "Lição Aprovada: " + servico.getCodigo(),
                    "A lição aprendida registrada na OS " + servico.getCodigo() + " foi aprovada e formalizada pelo validador.",
                    "LICAO_APROVADA",
                    servico.getId(),
                    "/interno/licoes?aba=conhecimento&servicoId=" + servico.getId()
            );
        }

        Set<TermoVocabulario> todosTermos = new HashSet<>();
        if (blocoAprendizado.getCausaDesvio() != null) {
            todosTermos.add(blocoAprendizado.getCausaDesvio());
        }
        if (blocoAprendizado.getAssuntosRelacionados() != null) {
            todosTermos.addAll(blocoAprendizado.getAssuntosRelacionados());
        }

        if (!todosTermos.isEmpty()) {
            List<Long> termosIds = todosTermos.stream()
                    .map(TermoVocabulario::getId)
                    .filter(Objects::nonNull)
                    .toList();
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
                        msg,
                        "LICAO_APROVADA",
                        servico.getId(),
                        "/interno/licoes?aba=conhecimento&servicoId=" + servico.getId()
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
            throw new RequisicaoInvalidaException("Apenas lições pendentes de validação podem ser devolvidas.");
        }

        if (request.motivoRejeicao() == null || request.motivoRejeicao().trim().isBlank()) {
            throw new RequisicaoInvalidaException("O motivo da devolução da lição é obrigatório.");
        }

        blocoAprendizado.setStatusLicao(StatusLicao.RASCUNHO);
        blocoAprendizado.setMotivoRejeicao(request.motivoRejeicao().trim());
        servicoRepository.persist(servico);

        var autor = servico.getBlocoOrcamento() != null ? servico.getBlocoOrcamento().getResponsavelEstimativa() : null;
        if (autor != null) {
            String link = "/interno/servicos?servicoId=" + servico.getId() + "&acao=revisarLicao";
            String msg = String.format(
                    "A lição aprendida da OS %s foi devolvida pelo validador técnico para ajuste:\n\"%s\"",
                    servico.getCodigo(),
                    request.motivoRejeicao().trim()
            );
            notificacaoService.criarNotificacao(
                    autor.getId(),
                    "Lição Devolvida para Ajuste: " + servico.getCodigo(),
                    msg,
                    "LICAO_DEVOLVIDA",
                    servico.getId(),
                    link
            );
        }

        return mapper.toResponse(servico);
    }

    @Transactional
    public ServicoResponse marcarComoSuperada(Long servicoId) {
        var servico = servicoRepository.findByIdOptional(servicoId)
                .orElseThrow(() -> new NaoEncontradoException("Serviço não encontrado"));

        var blocoAprendizado = servico.getBlocoAprendizado();
        if (blocoAprendizado == null || blocoAprendizado.getStatusLicao() != StatusLicao.FORMALIZADA) {
            throw new RequisicaoInvalidaException("Apenas lições formalizadas podem ser marcadas como superadas.");
        }

        blocoAprendizado.setStatusLicao(StatusLicao.SUPERADA);
        servicoRepository.persist(servico);

        return mapper.toResponse(servico);
    }

    @Transactional
    public ServicoResponse reativarLicao(Long servicoId) {
        var servico = servicoRepository.findByIdOptional(servicoId)
                .orElseThrow(() -> new NaoEncontradoException("Serviço não encontrado"));

        var blocoAprendizado = servico.getBlocoAprendizado();
        if (blocoAprendizado == null || blocoAprendizado.getStatusLicao() != StatusLicao.SUPERADA) {
            throw new RequisicaoInvalidaException("Apenas lições superadas podem ser reativadas.");
        }

        blocoAprendizado.setStatusLicao(StatusLicao.FORMALIZADA);
        servicoRepository.persist(servico);

        return mapper.toResponse(servico);
    }
}
