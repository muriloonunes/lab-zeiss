package com.senai.notificacao.resource;

import com.senai.notificacao.dto.ContagemNaoLidasResponse;
import com.senai.notificacao.dto.NotificacaoResponse;
import com.senai.notificacao.service.NotificacaoService;
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
 * @date 22/09/2026
 * @brief Class NotificacaoResource
 */
@Path("/api/notificacoes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class NotificacaoResource {

    @Inject
    NotificacaoService notificacaoService;

    @Inject
    JsonWebToken jwt;

    private Long getUsuarioIdAutenticado() {
        return Long.parseLong(jwt.getSubject());
    }

    @GET
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public List<NotificacaoResponse> listarMinhasNotificacoes() {
        return notificacaoService.listarPorUsuario(getUsuarioIdAutenticado());
    }

    @GET
    @Path("/nao-lidas/contagem")
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public ContagemNaoLidasResponse contarNaoLidas() {
        return notificacaoService.contarNaoLidas(getUsuarioIdAutenticado());
    }

    @PATCH
    @Path("/{id}/ler")
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public Response marcarComoLida(@PathParam("id") Long id) {
        NotificacaoResponse response = notificacaoService.marcarComoLida(id, getUsuarioIdAutenticado());
        return Response.ok(response).build();
    }

    @PATCH
    @Path("/ler-todas")
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public Response marcarTodasComoLidas() {
        notificacaoService.marcarTodasComoLidas(getUsuarioIdAutenticado());
        return Response.noContent().build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public Response excluirNotificacao(@PathParam("id") Long id) {
        notificacaoService.excluirNotificacao(id, getUsuarioIdAutenticado());
        return Response.noContent().build();
    }
}
