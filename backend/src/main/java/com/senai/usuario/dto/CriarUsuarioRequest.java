package com.senai.usuario.dto;

import com.senai.usuario.TipoUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CriarUsuarioRequest(
        @NotBlank @Size(max = 120) String nome,
        @NotBlank @Size(max = 60) String username,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8) String senha,
        @NotNull TipoUsuario tipoUsuario
) {
}
