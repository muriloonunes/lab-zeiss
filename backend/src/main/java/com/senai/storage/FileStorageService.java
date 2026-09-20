package com.senai.storage;

import java.io.InputStream;
import java.nio.file.Path;

/**
 * Interface abstrata para armazenamento de arquivos de solicitações.
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 19/09/2026
 */
public interface FileStorageService {

    /**
     * Salva um arquivo na subpasta da solicitação correspondente.
     *
     * @param solicitacaoId ID da solicitação associada
     * @param nomeOriginal  Nome original do arquivo enviado
     * @param inputStream   Fluxo de dados do arquivo
     * @return Caminho relativo padronizado gravado no storage (ex: solicitacao_1/arquivo.step)
     */
    String salvarArquivo(Long solicitacaoId, String nomeOriginal, InputStream inputStream);

    /**
     * Salva um arquivo a partir de um arquivo temporário no disco.
     *
     * @param solicitacaoId ID da solicitação associada
     * @param nomeOriginal  Nome original do arquivo enviado
     * @param tempFilePath  Path do arquivo temporário gerado pelo multipart
     * @return Caminho relativo padronizado gravado no storage
     */
    String salvarArquivo(Long solicitacaoId, String nomeOriginal, Path tempFilePath);

    /**
     * Obtém o Path físico do arquivo para envio/download.
     *
     * @param caminhoRelativo Caminho relativo gravado no banco de dados
     * @return Path absoluto no sistema de arquivos
     */
    Path obterCaminhoArquivo(String caminhoRelativo);

    /**
     * Abre um InputStream para leitura do arquivo.
     *
     * @param caminhoRelativo Caminho relativo gravado no banco de dados
     * @return InputStream para leitura do arquivo
     */
    InputStream obterArquivo(String caminhoRelativo);

    /**
     * Remove um arquivo individual.
     *
     * @param caminhoRelativo Caminho relativo gravado no banco de dados
     * @return true se removido com sucesso
     */
    boolean removerArquivo(String caminhoRelativo);

    /**
     * Remove o diretório completo da solicitação e todos os seus arquivos.
     *
     * @param solicitacaoId ID da solicitação
     * @return true se removido com sucesso
     */
    boolean removerPastaSolicitacao(Long solicitacaoId);
}
