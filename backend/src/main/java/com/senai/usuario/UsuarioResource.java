package com.senai.usuario;

import com.senai.usuario.dto.*;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 15/09/2026
 * @brief Class UsuarioResource
 */
@Path("/api/usuarios")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UsuarioResource {
    @Inject
    UsuarioService service;
    @Inject
    SecurityIdentity identity;

    @POST
    @RolesAllowed("ADMINISTRADOR")
    public Response criar(@Valid CriarUsuarioRequest request) {
        UsuarioResponse response = service.criar(request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @GET
    @RolesAllowed("ADMINISTRADOR")
    public List<UsuarioResponse> listar() {
        return service.listar();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed("ADMINISTRADOR")
    public UsuarioResponse buscar(@PathParam("id") Long id) {
        return service.buscarPorId(id);
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("ADMINISTRADOR")
    public Response desativar(@PathParam("id") Long id) {
        service.desativar(id);
        return Response.noContent().build();
    }

    @PUT
    @Path("/{id}/reativar")
    @RolesAllowed("ADMINISTRADOR")
    public Response reativar(@PathParam("id") Long id) {
        service.reativar(id);
        return Response.noContent().build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("ADMINISTRADOR")
    public UsuarioResponse atualizar(@PathParam("id") Long id, @Valid AtualizarUsuarioRequest request) {
        return service.atualizar(id, request);
    }

    @PUT
    @Path("/{id}/senha")
    @RolesAllowed("ADMINISTRADOR")
    public Response redefinirSenha(@PathParam("id") Long id,
                                   @Valid RedefinirSenhaRequest request) {
        service.redefinirSenha(id, request);
        return Response.noContent().build();
    }

    @PUT
    @Path("/me/senha")
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public Response alterarSenhaPropria(@Valid AlterarSenhaRequest request) {
        service.alterarSenhaPropria(identity.getPrincipal().getName(), request);
        return Response.noContent().build();
    }
}
