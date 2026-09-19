package com.senai.config;

import com.senai.common.exception.ConflitoException;
import com.senai.common.exception.NaoAutorizadoException;
import com.senai.common.exception.NaoEncontradoException;
import com.senai.common.exception.RequisicaoInvalidaException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.server.ServerExceptionMapper;

import java.util.List;
import java.util.Map;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 15/09/2026
 * @brief Class ExceptionMapper
 */

@ApplicationScoped
@Provider
public class ExceptionMapper {
    private static final Logger LOG = Logger.getLogger(ExceptionMapper.class);

    @ServerExceptionMapper
    public Response naoAutorizado(NaoAutorizadoException e) {
        return Response.status(401)
                .entity(Map.of("erro", e.getMessage()))
                .build();
    }

    @ServerExceptionMapper
    public Response conflito(ConflitoException e) {
        return Response.status(409)
                .entity(Map.of("erro", e.getMessage()))
                .build();
    }

    @ServerExceptionMapper
    public Response naoEncontrado(NaoEncontradoException e) {
        return Response.status(404)
                .entity(Map.of("erro", e.getMessage()))
                .build();
    }

    @ServerExceptionMapper
    public Response requisicaoInvalida(RequisicaoInvalidaException e) {
        return Response.status(400)
                .entity(Map.of("erro", e.getMessage()))
                .build();
    }

    @ServerExceptionMapper
    public Response validacao(ConstraintViolationException e) {
        List<Map<String, String>> erros = e.getConstraintViolations().stream()
                .map(v -> Map.of(
                        "campo", v.getPropertyPath().toString(),
                        "mensagem", v.getMessage()))
                .toList();
        return Response.status(400).entity(Map.of("erros", erros)).build();
    }

    @ServerExceptionMapper
    public Response webApplication(WebApplicationException e) {
        LOG.warn("Exceção de aplicação HTTP (" + e.getResponse().getStatus() + "): " + e.getMessage());
        return Response.status(e.getResponse().getStatus())
                .entity(Map.of("erro", e.getMessage() != null ? e.getMessage() : "Erro na requisição"))
                .build();
    }

    @ServerExceptionMapper
    public Response fallback(Exception e) {
        LOG.error("Erro interno não tratado no servidor: ", e);
        return Response.status(500)
                .entity(Map.of("erro", "Erro interno no servidor"))
                .build();
    }
}
