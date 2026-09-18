package com.senai.vocabulario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CriarClasseRequest(
        @NotBlank @Size(max = 80) String nome
) {
}
