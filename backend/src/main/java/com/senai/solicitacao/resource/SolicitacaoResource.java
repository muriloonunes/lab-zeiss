package com.senai.solicitacao.resource;

import com.senai.solicitacao.domain.StatusSolicitacao;
import com.senai.solicitacao.dto.AtualizarStatusSolicitacaoRequest;
import com.senai.solicitacao.dto.CriarSolicitacaoMultipartRequest;
import com.senai.solicitacao.dto.SolicitacaoResponse;
import com.senai.solicitacao.service.SolicitacaoService;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Endpoints REST para envio público de orçamentos e gestão interna das solicitações.
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 19/09/2026
 */
@Path("/api/solicitacoes")
public class SolicitacaoResource {

    @Inject
    SolicitacaoService service;

    /**
     * Endpoint público para submissão do formulário de contato / orçamento com upload de arquivos técnicos.
     */
    @POST
    @PermitAll
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Response criarPublico(@BeanParam @Valid CriarSolicitacaoMultipartRequest request) {
        SolicitacaoResponse response = service.criar(request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    /**
     * Listagem de todas as solicitações para a área interna (com filtro opcional por status).
     */
    @GET
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    @Produces(MediaType.APPLICATION_JSON)
    public List<SolicitacaoResponse> listar(@QueryParam("status") StatusSolicitacao status) {
        return service.listar(status);
    }

    /**
     * Detalhes de uma solicitação específica.
     */
    @GET
    @Path("/{id}")
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    @Produces(MediaType.APPLICATION_JSON)
    public SolicitacaoResponse buscarPorId(@PathParam("id") Long id) {
        return service.buscarPorId(id);
    }

    /**
     * Atualização do status e anotações técnicas da solicitação.
     */
    @PATCH
    @Path("/{id}/status")
    @RolesAllowed({"TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public SolicitacaoResponse atualizarStatus(
            @PathParam("id") Long id,
            @Valid AtualizarStatusSolicitacaoRequest request) {
        return service.atualizarStatus(id, request);
    }

    /**
     * Download seguro do arquivo técnico anexado à solicitação.
     */
    @GET
    @Path("/{solicitacaoId}/arquivos/{arquivoId}/download")
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public Response downloadArquivo(
            @PathParam("solicitacaoId") Long solicitacaoId,
            @PathParam("arquivoId") Long arquivoId) {
        SolicitacaoService.ArquivoDownloadInfo downloadInfo = service.obterArquivoParaDownload(solicitacaoId, arquivoId);

        String encodedFilename = URLEncoder.encode(downloadInfo.nomeOriginal(), StandardCharsets.UTF_8).replace("+", "%20");
        String disposition = "attachment; filename=\"" + downloadInfo.nomeOriginal().replace("\"", "_") + "\"; filename*=UTF-8''" + encodedFilename;

        String mediaType = downloadInfo.tipoMime() != null && !downloadInfo.tipoMime().isBlank()
                ? downloadInfo.tipoMime()
                : MediaType.APPLICATION_OCTET_STREAM;

        return Response.ok(downloadInfo.file(), mediaType)
                .header("Content-Disposition", disposition)
                .build();
    }

    /**
     * Exclusão definitiva de uma solicitação e de seus arquivos do disco (apenas administradores).
     */
    @DELETE
    @Path("/{id}")
    @RolesAllowed("ADMINISTRADOR")
    public Response excluir(@PathParam("id") Long id) {
        service.excluir(id);
        return Response.noContent().build();
    }
}
