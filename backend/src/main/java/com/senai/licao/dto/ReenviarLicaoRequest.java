package com.senai.licao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ReenviarLicaoRequest(
        @NotNull(message = "A causa do desvio é obrigatória")
        Long causaDesvioId,

        @NotBlank(message = "O relato da lição aprendida é obrigatório")
        String licaoAprendida,

        List<Long> assuntosRelacionadosIds,

        @NotNull(message = "O campo restrito é obrigatório")
        Boolean restrito
) {
}
