package com.senai.vocabulario.resource;

import com.senai.vocabulario.dto.CriarTermoRequest;
import com.senai.vocabulario.dto.TermoResponse;
import com.senai.vocabulario.service.TermoVocabularioService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.resteasy.reactive.RestQuery;

import java.util.List;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 18/09/2026
 * @brief Class TermoResource
 */

@Path("/api/vocabulario/termos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TermoResource {
    @Inject
    TermoVocabularioService termoService;

    @GET
    @Path("/{id}")
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public TermoResponse buscarPorId(@PathParam("id") Long id) {
        return termoService.buscarPorId(id);
    }

    @GET
    @Path("/por-classe")
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public List<TermoResponse> buscarPorClasse(@RestQuery @NotBlank String nomeClasse) {
        return termoService.listarAtivosPorNomeClasse(nomeClasse);
    }

    @POST
    @Path("/classe/{classeId}")
    @RolesAllowed({"ADMINISTRADOR"})
    public Response criarTermo(@PathParam("classeId") Long classeId, @Valid CriarTermoRequest request) {
        TermoResponse novoTermo = termoService.criar(classeId, request.descricao());
        return Response.status(Response.Status.CREATED).entity(novoTermo).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"ADMINISTRADOR"})
    public TermoResponse atualizarTermo(@PathParam("id") Long id, @Valid CriarTermoRequest request) {
        return termoService.atualizar(id, request.descricao());
    }

    @PATCH
    @Path("/{id}/status")
    @RolesAllowed({"ADMINISTRADOR"})
    public Response alternarStatus(@PathParam("id") Long id, @RestQuery boolean ativo) {
        termoService.alternarStatus(id, ativo);
        return Response.noContent().build();
    }
}
