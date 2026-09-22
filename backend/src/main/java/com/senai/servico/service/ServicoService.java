package com.senai.servico.service;

import com.senai.common.exception.ConflitoException;
import com.senai.common.exception.NaoEncontradoException;
import com.senai.common.exception.RequisicaoInvalidaException;
import com.senai.servico.ServicoMapper;
import com.senai.servico.domain.*;
import com.senai.servico.dto.*;
import com.senai.servico.repository.ServicoRepository;
import com.senai.usuario.UsuarioRepository;
import com.senai.vocabulario.TermoVocabulario;
import com.senai.vocabulario.repository.TermoVocabularioRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Year;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 20/09/2026
 * @brief Class ServicoService
 */
@ApplicationScoped
public class ServicoService {
    @Inject
    ServicoRepository servicoRepository;

    @Inject
    TermoVocabularioRepository termoRepository;

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    ServicoMapper mapper;

    public List<ServicoResponse> listarTodos(StatusServico status) {
        List<RegistroServico> servicos;
        if (status != null) {
            servicos = servicoRepository.listarPorStatus(status);
        } else {
            servicos = servicoRepository.listarTodosOrdenadosPorData();
        }
        return mapper.toResponseList(servicos);
    }

    public ServicoResponse buscarPorId(Long id) {
        var servico = servicoRepository.findByIdOptional(id)
                .orElseThrow(() -> new NaoEncontradoException("Serviço não encontrado"));
        return mapper.toResponse(servico);
    }

    @Transactional
    public ServicoResponse criar(CriarServicoRequest request, Long usuarioId) {
        String codigo = null;

        if (request.codigo() != null && !request.codigo().isBlank()) {
            codigo = request.codigo().replace("SOL", "OS").trim();

            if (servicoRepository.encontrarPorCodigo(codigo).isPresent()) {
                throw new ConflitoException("Já existe um serviço com o código informado");
            }
        }

        var tipoServico = termoRepository.findByIdOptional(request.tipoServicoId())
                .orElseThrow(() -> new NaoEncontradoException("Tipo de serviço não encontrado"));

        if (!tipoServico.getClasse().getNome().equalsIgnoreCase("Tipo de Serviço") || !tipoServico.isAtivo()) {
            throw new RequisicaoInvalidaException("Termo inválido ou inativo para Tipo de Serviço.");
        }

        var recurso = termoRepository.findByIdOptional(request.recursoId())
                .orElseThrow(() -> new NaoEncontradoException("Recurso não encontrado"));

        if (!recurso.getClasse().getNome().equalsIgnoreCase("Recurso") || !recurso.isAtivo()) {
            throw new RequisicaoInvalidaException("Termo inválido ou inativo para Recurso.");
        }

        Set<TermoVocabulario> caracteristicasPeca = new HashSet<>();
        for (Long caracteristicaId : request.caracteristicasPecaIds()) {
            var caracteristica = termoRepository.findByIdOptional(caracteristicaId)
                    .orElseThrow(() -> new NaoEncontradoException("Característica da peça não encontrada"));

            if (!caracteristica.getClasse().getNome().equalsIgnoreCase("Característica da Peça")) {
                throw new RequisicaoInvalidaException("A característica '" + caracteristica.getDescricao() + "' é inválida");
            }

            if (!caracteristica.isAtivo()) {
                throw new RequisicaoInvalidaException("A característica '" + caracteristica.getDescricao() + "' está inativa.");
            }

            caracteristicasPeca.add(caracteristica);
        }

        var responsavel = usuarioRepository.findByIdOptional(usuarioId)
                .orElseThrow(() -> new NaoEncontradoException("Usuário responsável não encontrado."));

        if (!responsavel.isAtivo()) {
            throw new RequisicaoInvalidaException("O usuário responsável informado está inativo.");
        }

        RegistroServico registroServico = new RegistroServico();
        registroServico.setCodigo(codigo);
        registroServico.setStatus(StatusServico.ORCADO);

        BlocoOrcamento blocoOrcamento = registroServico.getBlocoOrcamento() != null ? registroServico.getBlocoOrcamento() : new BlocoOrcamento();

        blocoOrcamento.setTipoServico(tipoServico);
        blocoOrcamento.setCaracteristicasPeca(caracteristicasPeca);
        blocoOrcamento.setRecurso(recurso);
        blocoOrcamento.setHorasEstimadas(request.horasEstimadas());
        blocoOrcamento.setCustoEstimado(request.custoEstimado());
        blocoOrcamento.setValorProposto(request.valorProposto());
        blocoOrcamento.setResponsavelEstimativa(responsavel);
        blocoOrcamento.setPremissasAssumidas(request.premissasAssumidas());
        blocoOrcamento.setJustificativaDesvioAssistente(request.justificativaDesvioAssistente());

        registroServico.setBlocoOrcamento(blocoOrcamento);

        servicoRepository.persist(registroServico);

        if (registroServico.getCodigo() == null) {
            String codigoFinal = String.format("OS-%d-%04d", Year.now().getValue(), registroServico.getId());
            registroServico.setCodigo(codigoFinal);
        }

        return mapper.toResponse(registroServico);
    }

    @Transactional
    public ServicoResponse iniciarExecucao(Long id) {
        var servico = servicoRepository.findByIdOptional(id)
                .orElseThrow(() -> new NaoEncontradoException("Serviço não encontrado"));

        if (servico.getStatus() == StatusServico.CONCLUIDO) {
            throw new RequisicaoInvalidaException("Não é possível iniciar um serviço já concluído.");
        }
        if (servico.getStatus() == StatusServico.CANCELADO) {
            throw new RequisicaoInvalidaException("Não é possível iniciar um serviço cancelado.");
        }

        servico.setStatus(StatusServico.EM_EXECUCAO);
        servicoRepository.persist(servico);
        return mapper.toResponse(servico);
    }

    @Transactional
    public ServicoResponse cancelar(Long id, CancelarServicoRequest request) {
        var servico = servicoRepository.findByIdOptional(id)
                .orElseThrow(() -> new NaoEncontradoException("Serviço não encontrado"));

        if (servico.getStatus() == StatusServico.CONCLUIDO) {
            throw new RequisicaoInvalidaException("Não é possível cancelar um serviço já concluído.");
        }

        servico.setStatus(StatusServico.CANCELADO);
        servico.setMotivoCancelamento(request.motivoCancelamento());

        servicoRepository.persist(servico);
        return mapper.toResponse(servico);
    }

    @Transactional
    public ServicoResponse salvarComoRascunho(Long id, RascunharServicoRequest request) {
        var servico = servicoRepository.findByIdOptional(id)
                .orElseThrow(() -> new NaoEncontradoException("Serviço não encontrado"));

        if (servico.getStatus() == StatusServico.CONCLUIDO) {
            throw new RequisicaoInvalidaException("Este serviço já foi finalizado e não pode ser editado como rascunho.");
        }
        if (servico.getStatus() == StatusServico.CANCELADO) {
            throw new RequisicaoInvalidaException("Esse serviço já foi cancelado.");
        }

        var blocoRealizado = servico.getBlocoRealizado() != null ? servico.getBlocoRealizado() : new BlocoRealizado();
        var blocoAprendizado = servico.getBlocoAprendizado() != null ? servico.getBlocoAprendizado() : new BlocoAprendizado();

        blocoRealizado.setHorasRealizadas(request.horasRealizadas());
        blocoRealizado.setCustoReal(request.custoReal());
        blocoRealizado.setValorFaturado(request.valorFaturado());
        blocoRealizado.setDataRealEntrega(request.dataRealEntrega());
        blocoRealizado.setHouveRetrabalho(request.houveRetrabalho());
        blocoRealizado.setHouveMudancaEscopo(request.houveMudancaEscopo());

        if (request.causaDesvioId() != null) {
            var causaDesvio = termoRepository.findByIdOptional(request.causaDesvioId())
                    .orElseThrow(() -> new NaoEncontradoException("Causa de desvio informada não existe."));
            blocoAprendizado.setCausaDesvio(causaDesvio);
        }

        Set<TermoVocabulario> assuntosRelacionados = new HashSet<>();
        if (request.assuntosRelacionadosIds() != null && !request.assuntosRelacionadosIds().isEmpty()) {
            for (Long assuntoId : request.assuntosRelacionadosIds()) {
                termoRepository.findByIdOptional(assuntoId).ifPresent(assuntosRelacionados::add);
            }
        }
        blocoAprendizado.setAssuntosRelacionados(assuntosRelacionados);

        if (request.licaoAprendida() != null) {
            blocoAprendizado.setLicaoAprendida(request.licaoAprendida().trim());
        }
        if (request.restrito() != null) {
            blocoAprendizado.setRestrito(request.restrito());
        }

        blocoAprendizado.setStatusLicao(StatusLicao.RASCUNHO);

        servico.setBlocoRealizado(blocoRealizado);
        servico.setBlocoAprendizado(blocoAprendizado);

        servicoRepository.persist(servico);
        return mapper.toResponse(servico);
    }

    @Transactional
    public ServicoResponse concluirServico(Long id, ConcluirServicoRequest request) {
        var servico = servicoRepository.findByIdOptional(id)
                .orElseThrow(() -> new NaoEncontradoException("Serviço não encontrado"));

        if (servico.getStatus() == StatusServico.CONCLUIDO) {
            throw new RequisicaoInvalidaException("Este serviço já se encontra finalizado.");
        }
        if (servico.getStatus() == StatusServico.CANCELADO) {
            throw new RequisicaoInvalidaException("Não é permitido concluir um serviço cancelado.");
        }

        if (request.licaoAprendida() == null || request.licaoAprendida().isBlank()) {
            throw new RequisicaoInvalidaException("O relato da lição aprendida é obrigatório para concluir o serviço.");
        }

        var blocoRealizado = servico.getBlocoRealizado() != null ? servico.getBlocoRealizado() : new BlocoRealizado();
        var blocoAprendizado = servico.getBlocoAprendizado() != null ? servico.getBlocoAprendizado() : new BlocoAprendizado();

        blocoRealizado.setHorasRealizadas(request.horasRealizadas());
        blocoRealizado.setCustoReal(request.custoReal());
        blocoRealizado.setValorFaturado(request.valorFaturado());
        blocoRealizado.setDataRealEntrega(request.dataRealEntrega());
        blocoRealizado.setHouveRetrabalho(request.houveRetrabalho());
        blocoRealizado.setHouveMudancaEscopo(request.houveMudancaEscopo());

        var causaDesvio = termoRepository.findByIdOptional(request.causaDesvioId())
                .orElseThrow(() -> new NaoEncontradoException("Causa de desvio informada não existe."));

        if (!causaDesvio.getClasse().getNome().equalsIgnoreCase("Causa do Desvio") || !causaDesvio.isAtivo()) {
            throw new RequisicaoInvalidaException("Termo inválido ou inativo para Causa do Desvio.");
        }

        Set<TermoVocabulario> assuntosRelacionados = new HashSet<>();
        if (request.assuntosRelacionadosIds() != null) {
            for (Long assuntoId : request.assuntosRelacionadosIds()) {
                var assunto = termoRepository.findByIdOptional(assuntoId)
                        .orElseThrow(() -> new NaoEncontradoException("Assunto relacionado ID " + assuntoId + " não encontrado."));
                if (!assunto.isAtivo()) {
                    throw new RequisicaoInvalidaException("O termo '" + assunto.getDescricao() + "' está inativo.");
                }
                assuntosRelacionados.add(assunto);
            }
        }

        blocoAprendizado.setCausaDesvio(causaDesvio);
        blocoAprendizado.setLicaoAprendida(request.licaoAprendida().trim());
        blocoAprendizado.setAssuntosRelacionados(assuntosRelacionados);
        blocoAprendizado.setRestrito(request.restrito());
        blocoAprendizado.setMotivoRejeicao(null);
        blocoAprendizado.setStatusLicao(StatusLicao.EM_VALIDACAO);
        servico.setBlocoRealizado(blocoRealizado);
        servico.setBlocoAprendizado(blocoAprendizado);
        servico.setStatus(StatusServico.CONCLUIDO);

        servicoRepository.persist(servico);
        return mapper.toResponse(servico);
    }

    @Transactional
    public ServicoResponse reenviarLicao(Long id, ReenviarLicaoRequest request) {
        var servico = servicoRepository.findByIdOptional(id)
                .orElseThrow(() -> new NaoEncontradoException("Serviço não encontrado"));

        if (servico.getStatus() != StatusServico.CONCLUIDO) {
            throw new RequisicaoInvalidaException("A lição só pode ser reenviada para serviços concluídos.");
        }

        var causaDesvio = termoRepository.findByIdOptional(request.causaDesvioId())
                .orElseThrow(() -> new NaoEncontradoException("Causa de desvio informada não existe."));

        if (!causaDesvio.getClasse().getNome().equalsIgnoreCase("Causa do Desvio") || !causaDesvio.isAtivo()) {
            throw new RequisicaoInvalidaException("Termo inválido ou inativo para Causa do Desvio.");
        }

        Set<TermoVocabulario> assuntosRelacionados = new HashSet<>();
        if (request.assuntosRelacionadosIds() != null) {
            for (Long assuntoId : request.assuntosRelacionadosIds()) {
                var assunto = termoRepository.findByIdOptional(assuntoId)
                        .orElseThrow(() -> new NaoEncontradoException("Assunto relacionado ID " + assuntoId + " não encontrado."));
                if (!assunto.isAtivo()) {
                    throw new RequisicaoInvalidaException("O termo '" + assunto.getDescricao() + "' está inativo.");
                }
                assuntosRelacionados.add(assunto);
            }
        }

        var blocoAprendizado = servico.getBlocoAprendizado() != null ? servico.getBlocoAprendizado() : new BlocoAprendizado();
        blocoAprendizado.setCausaDesvio(causaDesvio);
        blocoAprendizado.setLicaoAprendida(request.licaoAprendida().trim());
        blocoAprendizado.setAssuntosRelacionados(assuntosRelacionados);
        blocoAprendizado.setRestrito(request.restrito());
        blocoAprendizado.setMotivoRejeicao(null);
        blocoAprendizado.setStatusLicao(StatusLicao.EM_VALIDACAO);

        servico.setBlocoAprendizado(blocoAprendizado);
        servicoRepository.persist(servico);
        return mapper.toResponse(servico);
    }
}
