package com.senai.licao.dto;

import jakarta.validation.constraints.NotBlank;

public record DevolverLicaoRequest(
        @NotBlank(message = "A justificativa/motivo da devolução é obrigatório.")
        String motivoRejeicao
) {
}
