package com.senai.servico.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 22/09/2026
 * @brief DTO ReenviarLicaoRequest
 */
public record ReenviarLicaoRequest(
        @NotNull(message = "A causa de desvio é obrigatória.")
        Long causaDesvioId,

        @NotBlank(message = "O relato da lição aprendida é obrigatório.")
        String licaoAprendida,

        Set<Long> assuntosRelacionadosIds,

        @NotNull(message = "A indicação de restrição é obrigatória.")
        Boolean restrito
) {
}
