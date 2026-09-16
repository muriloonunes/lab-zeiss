package com.senai.config;

import com.senai.common.exception.ConflitoException;
import com.senai.common.exception.NaoAutorizadoException;
import com.senai.common.exception.NaoEncontradoException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
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
    public Response validacao(ConstraintViolationException e) {
        List<Map<String, String>> erros = e.getConstraintViolations().stream()
                .map(v -> Map.of(
                        "campo", v.getPropertyPath().toString(),
                        "mensagem", v.getMessage()))
                .toList();
        return Response.status(400).entity(Map.of("erros", erros)).build();
    }

    @ServerExceptionMapper
    public Response fallback(Exception e) {
        return Response.status(500)
                .entity(Map.of("erro", "Erro interno"))
                .build();
    }
}
