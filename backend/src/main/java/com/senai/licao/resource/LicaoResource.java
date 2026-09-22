package com.senai.licao.resource;

import com.senai.licao.dto.DevolverLicaoRequest;
import com.senai.licao.dto.ReenviarLicaoRequest;
import com.senai.licao.service.LicaoService;
import com.senai.servico.dto.ServicoResponse;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

/**
 * Recurso REST para o subdomínio de Lições Aprendidas e Validação de Conhecimento.
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 22/09/2026
 */
@Path("/api/servicos/{servicoId}/aprendizado")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LicaoResource {

    @Inject
    LicaoService licaoService;

    @Inject
    JsonWebToken jwt;

    @PUT
    @Path("/reenviar")
    @RolesAllowed({"TECNICO", "ADMINISTRADOR"})
    public Response reenviarLicao(@PathParam("servicoId") Long servicoId, @Valid ReenviarLicaoRequest request) {
        ServicoResponse response = licaoService.reenviarLicao(servicoId, request);
        return Response.ok(response).build();
    }

    @PATCH
    @Path("/aprovar")
    @RolesAllowed({"VALIDADOR", "ADMINISTRADOR"})
    public Response aprovarLicao(@PathParam("servicoId") Long servicoId) {
        Long validadorId = Long.parseLong(jwt.getSubject());
        ServicoResponse response = licaoService.aprovarLicao(servicoId, validadorId);
        return Response.ok(response).build();
    }

    @PATCH
    @Path("/devolver")
    @RolesAllowed({"VALIDADOR", "ADMINISTRADOR"})
    public Response devolverLicao(@PathParam("servicoId") Long servicoId, @Valid DevolverLicaoRequest request) {
        ServicoResponse response = licaoService.devolverLicao(servicoId, request);
        return Response.ok(response).build();
    }
}
