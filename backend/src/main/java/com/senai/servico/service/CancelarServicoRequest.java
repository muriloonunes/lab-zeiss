package com.senai.servico.service;

import jakarta.validation.constraints.NotBlank;

public record CancelarServicoRequest(
        @NotBlank String motivoCancelamento
) {
}
