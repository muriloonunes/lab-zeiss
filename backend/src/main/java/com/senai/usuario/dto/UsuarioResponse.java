package com.senai.usuario.dto;

import com.senai.usuario.TipoUsuario;

import java.time.Instant;

public record UsuarioResponse(
        Long id,
        String nome,
        String username,
        String email,
        TipoUsuario tipoUsuario,
        boolean ativo,
        Instant dataCriacao
) {
}
