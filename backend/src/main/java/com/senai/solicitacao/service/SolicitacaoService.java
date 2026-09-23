package com.senai.solicitacao.service;

import com.senai.common.exception.NaoEncontradoException;
import com.senai.common.exception.RequisicaoInvalidaException;
import com.senai.solicitacao.domain.ArquivoSolicitacao;
import com.senai.solicitacao.domain.Solicitacao;
import com.senai.solicitacao.domain.StatusSolicitacao;
import com.senai.solicitacao.dto.AtualizarStatusSolicitacaoRequest;
import com.senai.solicitacao.dto.CriarSolicitacaoMultipartRequest;
import com.senai.solicitacao.dto.SolicitacaoResponse;
import com.senai.solicitacao.repository.ArquivoSolicitacaoRepository;
import com.senai.solicitacao.repository.SolicitacaoRepository;
import com.senai.storage.FileStorageService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.io.File;
import java.nio.file.Path;
import java.time.Year;
import java.util.List;

/**
 * Serviço responsável pelo processamento de solicitações de orçamento e arquivos técnicos.
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 19/09/2026
 */
@ApplicationScoped
public class SolicitacaoService {

    private static final int MAX_ARQUIVOS = 5;
    private static final long MAX_TAMANHO_TOTAL_BYTES = 25 * 1024 * 1024; // 25MB
    private static final List<String> EXTENSOES_PERMITIDAS = List.of("pdf", "step", "stp", "dwg", "iges", "igs", "dxf", "stl", "zip", "rar", "jpg", "jpeg", "png");

    @Inject
    SolicitacaoRepository solicitacaoRepository;

    @Inject
    ArquivoSolicitacaoRepository arquivoRepository;

    @Inject
    FileStorageService fileStorageService;

    @Inject
    SolicitacaoMapper mapper;

    @Transactional
    public SolicitacaoResponse criar(CriarSolicitacaoMultipartRequest request) {
        if (request.nome == null || request.nome.isBlank()) {
            throw new RequisicaoInvalidaException("O nome completo é obrigatório.");
        }
        if (request.empresa == null || request.empresa.isBlank()) {
            throw new RequisicaoInvalidaException("O nome da empresa é obrigatório.");
        }
        if (request.email == null || request.email.isBlank()) {
            throw new RequisicaoInvalidaException("O e-mail é obrigatório.");
        }
        if (request.telefone == null || request.telefone.isBlank()) {
            throw new RequisicaoInvalidaException("O telefone é obrigatório.");
        }
        if (request.servico == null || request.servico.isBlank()) {
            throw new RequisicaoInvalidaException("O serviço pretendido é obrigatório.");
        }

        List<FileUpload> arquivosUpload = request.files != null ? request.files : List.of();
        if (arquivosUpload.size() > MAX_ARQUIVOS) {
            throw new RequisicaoInvalidaException("São permitidos no máximo " + MAX_ARQUIVOS + " arquivos por solicitação.");
        }

        long tamanhoTotal = 0;
        for (FileUpload f : arquivosUpload) {
            String fileName = f.fileName();

            if (fileName == null || !fileName.contains(".")) {
                throw new RequisicaoInvalidaException("Arquivo inválido.");
            }

            var extensao = fileName.substring(fileName.lastIndexOf(".") + 1);
            if (!EXTENSOES_PERMITIDAS.contains(extensao.toLowerCase())) {
                throw new RequisicaoInvalidaException("A extensão " + extensao + " não é permitida.");
            }
            tamanhoTotal += f.size();
        }

        if (tamanhoTotal > MAX_TAMANHO_TOTAL_BYTES) {
            throw new RequisicaoInvalidaException("A soma de todos os arquivos anexados não pode ultrapassar 25MB.");
        }

        Solicitacao solicitacao = new Solicitacao(
                request.nome.trim(),
                request.empresa.trim(),
                request.email.trim(),
                request.telefone.trim(),
                request.servico.trim(),
                request.quantidadePecas != null ? request.quantidadePecas.trim() : null,
                request.mensagem != null ? request.mensagem.trim() : null
        );

        solicitacao.setCodigo("TEMP-" + System.currentTimeMillis());
        solicitacaoRepository.persist(solicitacao);

        String codigoFinal = String.format("SOL-%d-%04d", Year.now().getValue(), solicitacao.getId());
        solicitacao.setCodigo(codigoFinal);

        // Processa e armazena os arquivos anexados
        for (FileUpload fileUpload : arquivosUpload) {
            String nomeOriginal = fileUpload.fileName();
            String caminhoRelativo = fileStorageService.salvarArquivo(
                    solicitacao.getId(),
                    nomeOriginal,
                    fileUpload.filePath()
            );

            ArquivoSolicitacao arquivo = new ArquivoSolicitacao(
                    solicitacao,
                    nomeOriginal,
                    caminhoRelativo,
                    fileUpload.contentType(),
                    fileUpload.size()
            );
            solicitacao.adicionarArquivo(arquivo);
            arquivoRepository.persist(arquivo);
        }

        return mapper.toResponse(solicitacao);
    }

    public List<SolicitacaoResponse> listar(StatusSolicitacao status) {
        List<Solicitacao> solicitacoes = (status != null)
                ? solicitacaoRepository.listarPorStatus(status)
                : solicitacaoRepository.listarTodasOrdenadasPorData();

        return mapper.toResponseList(solicitacoes);
    }

    public SolicitacaoResponse buscarPorId(Long id) {
        Solicitacao solicitacao = solicitacaoRepository.findByIdOptional(id)
                .orElseThrow(() -> new NaoEncontradoException("Solicitação de ID " + id + " não encontrada."));
        return mapper.toResponse(solicitacao);
    }

    @Transactional
    public SolicitacaoResponse atualizarStatus(Long id, AtualizarStatusSolicitacaoRequest request) {
        Solicitacao solicitacao = solicitacaoRepository.findByIdOptional(id)
                .orElseThrow(() -> new NaoEncontradoException("Solicitação de ID " + id + " não encontrada."));

        solicitacao.setStatus(request.status());
        if (request.observacoesInternas() != null) {
            solicitacao.setObservacoesInternas(request.observacoesInternas().trim());
        }

        return mapper.toResponse(solicitacao);
    }

    public ArquivoDownloadInfo obterArquivoParaDownload(Long solicitacaoId, Long arquivoId) {
        ArquivoSolicitacao arquivo = arquivoRepository.buscarPorSolicitacaoEId(solicitacaoId, arquivoId)
                .orElseThrow(() -> new NaoEncontradoException("Arquivo não encontrado para esta solicitação."));

        Path caminho = fileStorageService.obterCaminhoArquivo(arquivo.getCaminhoRelativo());
        File file = caminho.toFile();

        return new ArquivoDownloadInfo(file, arquivo.getNomeOriginal(), arquivo.getTipoMime());
    }

    @Transactional
    public void excluir(Long id) {
        Solicitacao solicitacao = solicitacaoRepository.findByIdOptional(id)
                .orElseThrow(() -> new NaoEncontradoException("Solicitação de ID " + id + " não encontrada."));

        fileStorageService.removerPastaSolicitacao(id);
        solicitacaoRepository.delete(solicitacao);
    }

    public record ArquivoDownloadInfo(File file, String nomeOriginal, String tipoMime) {
    }
}
