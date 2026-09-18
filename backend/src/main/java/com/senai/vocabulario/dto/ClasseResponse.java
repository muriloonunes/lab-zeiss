package com.senai.vocabulario.dto;

public record ClasseResponse(
        Long id,
        String nome,
        boolean ativo,
        boolean classeBase
) {
}
