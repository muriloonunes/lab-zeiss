package com.senai.vocabulario.dto;

public record TermoResponse(
        Long id,
        String descricao,
        boolean ativo,
        Long classeId
) {
}
