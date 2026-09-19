package com.senai.vocabulario.resource;

import com.senai.vocabulario.dto.ClasseResponse;
import com.senai.vocabulario.dto.CriarClasseRequest;
import com.senai.vocabulario.dto.TermoResponse;
import com.senai.vocabulario.service.ClasseVocabularioService;
import com.senai.vocabulario.service.TermoVocabularioService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.resteasy.reactive.RestQuery;

import java.util.List;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 18/09/2026
 * @brief Class ClasseResource
 */
@Path("/api/vocabulario/classes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ClasseResource {
    @Inject
    ClasseVocabularioService classeService;

    @Inject
    TermoVocabularioService termoService;

    @Inject
    JsonWebToken jwt;

    private Long getUsuarioIdAutenticado() {
        try {
            if (jwt != null && jwt.getSubject() != null) {
                return Long.parseLong(jwt.getSubject());
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    @GET
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public List<ClasseResponse> listarClasses(@RestQuery @DefaultValue("true") boolean apenasAtivas) {
        Long usuarioId = getUsuarioIdAutenticado();
        return apenasAtivas
                ? classeService.listarAtivasOuComAssinaturaDoUsuario(usuarioId)
                : classeService.listarTodas();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public ClasseResponse obterClassePorId(@PathParam("id") Long id) {
        return classeService.buscarPorId(id);
    }

    @GET
    @Path("/{id}/termos")
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public List<TermoResponse> obterTermosPorClasse(
            @PathParam("id") Long id,
            @RestQuery @DefaultValue("true") boolean apenasAtivos
    ) {
        Long usuarioId = getUsuarioIdAutenticado();
        return apenasAtivos
                ? termoService.listarAtivosOuAssinadosPorClasse(id, usuarioId)
                : termoService.listarTodosPorClasse(id);
    }

    @POST
    @RolesAllowed({"ADMINISTRADOR"})
    public Response criarClasse(@Valid CriarClasseRequest request) {
        ClasseResponse classe = classeService.criar(request.nome(), false);
        return Response.status(Response.Status.CREATED).entity(classe).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"ADMINISTRADOR"})
    public ClasseResponse atualizarNome(@PathParam("id") Long id, @Valid CriarClasseRequest request) {
        return classeService.atualizarNome(id, request.nome());
    }

    @PATCH
    @Path("/{id}/status")
    @RolesAllowed("ADMINISTRADOR")
    public Response alternarStatus(@PathParam("id") Long id, @RestQuery boolean ativo) {
        classeService.alternarStatus(id, ativo);
        return Response.noContent().build();
    }
}
