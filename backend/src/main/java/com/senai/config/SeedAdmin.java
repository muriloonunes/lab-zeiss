package com.senai.config;

import com.senai.usuario.TipoUsuario;
import com.senai.usuario.UsuarioRepository;
import com.senai.usuario.UsuarioService;
import com.senai.usuario.dto.CriarUsuarioRequest;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 15/09/2026
 * @brief Class SeedAdmin
 */
@ApplicationScoped
public class SeedAdmin {
    private static final Logger LOGGER = Logger.getLogger(SeedAdmin.class);

    private final UsuarioRepository repository;
    private final UsuarioService usuarioService;

    @ConfigProperty(name = "app.seed.admin.senha")
    String senhaAdmin;

    public SeedAdmin(UsuarioRepository repository, UsuarioService usuarioService) {
        this.repository = repository;
        this.usuarioService = usuarioService;
    }

    void onStart(@Observes StartupEvent event) {
        if (repository.count() > 0) return;

        LOGGER.info("Criando admin inicial");
        usuarioService.criar(
                new CriarUsuarioRequest(
                        "Administrador",
                        "admin",
                        "admin@admin.com",
                        senhaAdmin,
                        TipoUsuario.ADMINISTRADOR
                )
        );
    }
}
