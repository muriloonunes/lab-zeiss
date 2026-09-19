package com.senai.vocabulario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CriarTermoRequest(
        @NotBlank @Size(max = 80) String descricao
) {
}
