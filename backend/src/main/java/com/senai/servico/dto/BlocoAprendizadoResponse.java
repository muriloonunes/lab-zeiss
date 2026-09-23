package com.senai.servico.dto;

import com.senai.servico.domain.StatusLicao;
import com.senai.vocabulario.dto.TermoResponse;

import java.util.Set;

public record BlocoAprendizadoResponse(
        TermoResponse causaDesvio,
        String licaoAprendida,
        Set<TermoResponse> assuntosRelacionados,
        StatusLicao statusLicao,
        Boolean restrito,
        String motivoRejeicao
) {}
