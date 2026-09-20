package com.senai.storage;

import com.senai.common.exception.RequisicaoInvalidaException;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Comparator;
import java.util.stream.Stream;

/**
 * Implementação local do serviço de armazenamento em disco.
 * Compatível de forma transparente com ambientes Windows e Linux.
 *
 * Garante que os arquivos sejam organizados na raiz do projeto dentro de /uploads/solicitacao_{id}/
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 19/09/2026
 */
@ApplicationScoped
public class LocalFileStorageService implements FileStorageService {

    @ConfigProperty(name = "app.storage.upload-dir", defaultValue = "uploads")
    String uploadDirConfig;

    private Path rootUploadPath;

    void onStart(@Observes StartupEvent ev) {
        initStorage();
    }

    private synchronized void initStorage() {
        if (rootUploadPath != null) {
            return;
        }

        Path currentDir = Paths.get("").toAbsolutePath().normalize();
        
        // Se a aplicação estiver rodando a partir da pasta /backend, aponta para ../uploads na raiz do lab-zeiss
        if (currentDir.getFileName() != null && currentDir.getFileName().toString().equalsIgnoreCase("backend")) {
            rootUploadPath = currentDir.getParent().resolve(uploadDirConfig).normalize();
        } else {
            rootUploadPath = currentDir.resolve(uploadDirConfig).normalize();
        }

        try {
            Files.createDirectories(rootUploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível inicializar a pasta de uploads em: " + rootUploadPath, e);
        }
    }

    private Path getRootPath() {
        if (rootUploadPath == null) {
            initStorage();
        }
        return rootUploadPath;
    }

    private String sanitizeFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return "arquivo_" + System.currentTimeMillis();
        }
        // Remove caminhos e caracteres inválidos para segurança contra path traversal
        String cleaned = Paths.get(filename).getFileName().toString();
        return cleaned.replaceAll("[\\\\/:*?\"<>|]", "_");
    }

    @Override
    public String salvarArquivo(Long solicitacaoId, String nomeOriginal, InputStream inputStream) {
        if (solicitacaoId == null) {
            throw new RequisicaoInvalidaException("ID da solicitação não pode ser nulo.");
        }

        String safeFileName = sanitizeFilename(nomeOriginal);
        String subfolderName = "solicitacao_" + solicitacaoId;
        Path solicitacaoDir = getRootPath().resolve(subfolderName).normalize();

        try {
            Files.createDirectories(solicitacaoDir);
            Path targetFile = solicitacaoDir.resolve(safeFileName).normalize();

            // Proteção contra path traversal
            if (!targetFile.startsWith(getRootPath())) {
                throw new RequisicaoInvalidaException("Tentativa de gravação fora do diretório de uploads.");
            }

            Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
            return subfolderName + "/" + safeFileName;
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar arquivo " + safeFileName + " para a solicitação " + solicitacaoId, e);
        }
    }

    @Override
    public String salvarArquivo(Long solicitacaoId, String nomeOriginal, Path tempFilePath) {
        try (InputStream is = Files.newInputStream(tempFilePath)) {
            return salvarArquivo(solicitacaoId, nomeOriginal, is);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao ler arquivo temporário de upload: " + tempFilePath, e);
        }
    }

    @Override
    public Path obterCaminhoArquivo(String caminhoRelativo) {
        if (caminhoRelativo == null || caminhoRelativo.isBlank()) {
            throw new RequisicaoInvalidaException("Caminho do arquivo não pode ser nulo.");
        }

        Path file = getRootPath().resolve(caminhoRelativo.replace('/', File.separatorChar).replace('\\', File.separatorChar)).normalize();

        if (!file.startsWith(getRootPath())) {
            throw new RequisicaoInvalidaException("Acesso negado ao arquivo solicitado.");
        }

        if (!Files.exists(file) || !Files.isRegularFile(file)) {
            throw new RequisicaoInvalidaException("Arquivo não encontrado no servidor.");
        }

        return file;
    }

    @Override
    public InputStream obterArquivo(String caminhoRelativo) {
        Path file = obterCaminhoArquivo(caminhoRelativo);
        try {
            return Files.newInputStream(file);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao abrir fluxo de leitura do arquivo: " + caminhoRelativo, e);
        }
    }

    @Override
    public boolean removerArquivo(String caminhoRelativo) {
        try {
            Path file = obterCaminhoArquivo(caminhoRelativo);
            return Files.deleteIfExists(file);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean removerPastaSolicitacao(Long solicitacaoId) {
        if (solicitacaoId == null) {
            return false;
        }
        String subfolderName = "solicitacao_" + solicitacaoId;
        Path solicitacaoDir = getRootPath().resolve(subfolderName).normalize();

        if (!Files.exists(solicitacaoDir)) {
            return true;
        }

        try (Stream<Path> walk = Files.walk(solicitacaoDir)) {
            walk.sorted(Comparator.reverseOrder())
                .forEach(path -> {
                    try {
                        Files.deleteIfExists(path);
                    } catch (IOException ignored) {
                    }
                });
            return true;
        } catch (IOException e) {
            return false;
        }
    }
}
