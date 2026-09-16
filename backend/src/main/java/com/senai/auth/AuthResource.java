package com.senai.auth;

import com.senai.auth.dto.LoginRequest;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.NewCookie;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;

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

    @POST
    @Path("/logout")
    @PermitAll
    public Response logout() {
        NewCookie cookie = new NewCookie.Builder(cookieName)
                .value("")
                .path("/")
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
                .path("/")
                .maxAge(8 * 60 * 60)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(NewCookie.SameSite.STRICT)
                .build();
    }
}
