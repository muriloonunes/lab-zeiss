package com.senai.assinatura;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 19/09/2026
 * @brief Class AssinaturaResource
 */
@Path("/api/assinaturas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AssinaturaResource {
    @Inject
    AssinaturaService assinaturaService;

    @Inject
    JsonWebToken jwt;

    private Long getUsuarioIdAutenticado() {
        return Long.parseLong(jwt.getSubject());
    }

    @GET
    @Path("/minhas")
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public List<Long> minhasAssinaturas() {
        return assinaturaService.listarIdsTermosAssinados(getUsuarioIdAutenticado());
    }

    @GET
    @Path("/minhas/classes")
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public List<Long> minhasClassesAssinadas() {
        return assinaturaService.listarIdsClassesComAssinatura(getUsuarioIdAutenticado());
    }

    @POST
    @Path("/termos/{termoId}")
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public Response assinarTermo(@PathParam("termoId") Long termoId) {
        assinaturaService.assinar(getUsuarioIdAutenticado(), termoId);
        return Response.noContent().build();
    }

    @DELETE
    @Path("/termos/{termoId}")
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public Response removerAssinatura(@PathParam("termoId") Long termoId) {
        assinaturaService.desassinar(getUsuarioIdAutenticado(), termoId);
        return Response.noContent().build();
    }

}
