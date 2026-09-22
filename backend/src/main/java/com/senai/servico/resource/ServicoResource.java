package com.senai.servico.resource;

import com.senai.servico.domain.StatusServico;
import com.senai.servico.dto.*;
import com.senai.servico.service.ServicoService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;

/**
 * Recurso REST para o ciclo de vida da Ordem de Serviço (OS).
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 21/09/2026
 * @brief Class ServicoResource
 */
@Path("/api/servicos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ServicoResource {
    @Inject
    ServicoService servicoService;

    @Inject
    JsonWebToken jwt;

    @GET
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public Response listar(@QueryParam("status") StatusServico status) {
        List<ServicoResponse> responses = servicoService.listarTodos(status);
        return Response.ok(responses).build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public Response buscarPorId(@PathParam("id") Long id) {
        ServicoResponse response = servicoService.buscarPorId(id);
        return Response.ok(response).build();
    }

    @POST
    @RolesAllowed({"TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public Response criar(@Valid CriarServicoRequest request) {
        Long usuarioId = Long.parseLong(jwt.getSubject());
        ServicoResponse response = servicoService.criar(request, usuarioId);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @PATCH
    @Path("/{id}/iniciar")
    @RolesAllowed({"TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public Response iniciar(@PathParam("id") Long id) {
        ServicoResponse response = servicoService.iniciarExecucao(id);
        return Response.ok().entity(response).build();
    }

    @PATCH
    @Path("/{id}/cancelar")
    @RolesAllowed({"TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public Response cancelar(@PathParam("id") Long id, @Valid CancelarServicoRequest request) {
        ServicoResponse response = servicoService.cancelar(id, request);
        return Response.ok().entity(response).build();
    }

    @PATCH
    @Path("/{id}/rascunho")
    @RolesAllowed({"TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public Response rascunhar(@PathParam("id") Long id, @Valid RascunharServicoRequest request) {
        ServicoResponse response = servicoService.salvarComoRascunho(id, request);
        return Response.ok().entity(response).build();
    }

    @PUT
    @Path("/{id}/concluir")
    @RolesAllowed({"TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public Response concluir(@PathParam("id") Long id, @Valid ConcluirServicoRequest request) {
        ServicoResponse response = servicoService.concluirServico(id, request);
        return Response.ok().entity(response).build();
    }
}
