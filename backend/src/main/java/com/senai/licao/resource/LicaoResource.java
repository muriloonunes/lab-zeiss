package com.senai.licao.resource;

import com.senai.licao.dto.ContagemPendentesResponse;
import com.senai.licao.dto.DevolverLicaoRequest;
import com.senai.licao.dto.ReenviarLicaoRequest;
import com.senai.licao.service.LicaoService;
import com.senai.servico.domain.StatusLicao;
import com.senai.servico.dto.ServicoResponse;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;

/**
 * Recurso REST para a Base de Conhecimento e Fila de Validação de Lições Aprendidas.
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 22/09/2026
 */
@Path("/api/licoes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LicaoResource {

    @Inject
    LicaoService licaoService;

    @Inject
    JsonWebToken jwt;

    @GET
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public Response listarBaseConhecimento(
            @QueryParam("status") StatusLicao status,
            @QueryParam("termoId") Long termoId,
            @QueryParam("busca") String busca
    ) {
        List<ServicoResponse> response = licaoService.listarBaseConhecimento(status, termoId, busca);
        return Response.ok(response).build();
    }

    @GET
    @Path("/validacao")
    @RolesAllowed({"VALIDADOR", "ADMINISTRADOR"})
    public Response listarPendentesValidacao() {
        List<ServicoResponse> response = licaoService.listarLicoesPendentesValidacao();
        return Response.ok(response).build();
    }

    @GET
    @Path("/validacao/contagem")
    @RolesAllowed({"VALIDADOR", "ADMINISTRADOR"})
    public Response contarPendentesValidacao() {
        ContagemPendentesResponse response = licaoService.contarLicoesPendentesValidacao();
        return Response.ok(response).build();
    }

    @PUT
    @Path("/{servicoId}/reenviar")
    @RolesAllowed({"TECNICO", "ADMINISTRADOR"})
    public Response reenviarLicao(@PathParam("servicoId") Long servicoId, @Valid ReenviarLicaoRequest request) {
        ServicoResponse response = licaoService.reenviarLicao(servicoId, request);
        return Response.ok(response).build();
    }

    @PATCH
    @Path("/{servicoId}/aprovar")
    @RolesAllowed({"VALIDADOR", "ADMINISTRADOR"})
    public Response aprovarLicao(@PathParam("servicoId") Long servicoId) {
        Long validadorId = Long.parseLong(jwt.getSubject());
        ServicoResponse response = licaoService.aprovarLicao(servicoId, validadorId);
        return Response.ok(response).build();
    }

    @PATCH
    @Path("/{servicoId}/devolver")
    @RolesAllowed({"VALIDADOR", "ADMINISTRADOR"})
    public Response devolverLicao(@PathParam("servicoId") Long servicoId, @Valid DevolverLicaoRequest request) {
        ServicoResponse response = licaoService.devolverLicao(servicoId, request);
        return Response.ok(response).build();
    }

    @PATCH
    @Path("/{servicoId}/superar")
    @RolesAllowed({"VALIDADOR", "ADMINISTRADOR"})
    public Response marcarComoSuperada(@PathParam("servicoId") Long servicoId) {
        ServicoResponse response = licaoService.marcarComoSuperada(servicoId);
        return Response.ok(response).build();
    }

    @PATCH
    @Path("/{servicoId}/reativar")
    @RolesAllowed({"VALIDADOR", "ADMINISTRADOR"})
    public Response reativarLicao(@PathParam("servicoId") Long servicoId) {
        ServicoResponse response = licaoService.reativarLicao(servicoId);
        return Response.ok(response).build();
    }
}
