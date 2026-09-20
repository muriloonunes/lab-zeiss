package com.senai.solicitacao.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.util.List;

/**
 * DTO para recebimento de dados multipart/form-data do formulário de contato público.
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 19/09/2026
 */
public class CriarSolicitacaoMultipartRequest {

    @RestForm
    @NotBlank(message = "O nome é obrigatório.")
    public String nome;

    @RestForm
    @NotBlank(message = "A empresa é obrigatória.")
    public String empresa;

    @RestForm
    @NotBlank(message = "O e-mail é obrigatório.")
    @Email(message = "O e-mail informado é inválido.")
    public String email;

    @RestForm
    @NotBlank(message = "O telefone é obrigatório.")
    public String telefone;

    @RestForm
    @NotBlank(message = "O serviço é obrigatório.")
    public String servico;

    @RestForm
    public String quantidadePecas;

    @RestForm
    public String mensagem;

    @RestForm("files")
    public List<FileUpload> files;
}
