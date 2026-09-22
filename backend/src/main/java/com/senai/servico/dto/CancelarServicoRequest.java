package com.senai.servico.dto;

import jakarta.validation.constraints.NotBlank;

public record CancelarServicoRequest(
        @NotBlank String motivoCancelamento
) {
}
