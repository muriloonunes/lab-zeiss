package com.senai.vocabulario.resource;

import com.senai.vocabulario.dto.ClasseResponse;
import com.senai.vocabulario.service.ClasseVocabularioService;
import com.senai.vocabulario.service.TermoVocabularioService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
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

    @GET
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public List<ClasseResponse> listarClasses(@RestQuery @DefaultValue("true") boolean apenasAtivas) {
        return apenasAtivas ? classeService.listarAtivas() : classeService.listarTodas();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"CONSULTA", "TECNICO", "VALIDADOR", "ADMINISTRADOR"})
    public ClasseResponse obterClassePorId(@PathParam("id") Long id) {
        return classeService.buscarPorId(id);
    }

}
