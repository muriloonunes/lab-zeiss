package com.senai.auth;

import com.senai.auth.dto.LoginRequest;
import com.senai.auth.dto.SessaoResponse;
import io.quarkus.security.Authenticated;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.NewCookie;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.jwt.JsonWebToken;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 15/09/2026
 * @brief Class AuthResource
 */
@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {
    @Inject
    AuthService authService;

    @Inject
    JsonWebToken jwt;

    @ConfigProperty(name = "app.cookie.secure", defaultValue = "false")
    boolean cookieSecure;

    @ConfigProperty(name = "mp.jwt.token.cookie")
    String cookieName;

    @POST
    @Path("/login")
    @PermitAll
    public Response login(@Valid LoginRequest request) {
        String token = authService.autenticar(request);
        return Response.noContent().cookie(criarCookie(token)).build();
    }

    @GET
    @Path("/me")
    @Authenticated
    public SessaoResponse me() {
        Long id = Long.parseLong(jwt.getSubject());
        return authService.buscarSessao(id);
    }

    @POST
    @Path("/logout")
    @PermitAll
    public Response logout() {
        NewCookie cookie = new NewCookie.Builder(cookieName)
                .value("")
                .path("/api")
                .maxAge(0)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(NewCookie.SameSite.STRICT)
                .build();
        return Response.noContent().cookie(cookie).build();
    }

    private NewCookie criarCookie(String token) {
        return new NewCookie.Builder(cookieName)
                .value(token)
                .path("/api")
                .maxAge(8 * 60 * 60)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(NewCookie.SameSite.STRICT)
                .build();
    }
}
