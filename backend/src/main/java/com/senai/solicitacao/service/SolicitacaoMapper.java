package com.senai.solicitacao.service;

import com.senai.solicitacao.domain.ArquivoSolicitacao;
import com.senai.solicitacao.domain.Solicitacao;
import com.senai.solicitacao.dto.ArquivoSolicitacaoResponse;
import com.senai.solicitacao.dto.SolicitacaoResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

/**
 * Mapper para conversão entre entidades Solicitacao / ArquivoSolicitacao e DTOs de resposta.
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 19/09/2026
 */
@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface SolicitacaoMapper {

    @Mapping(target = "arquivos", source = "arquivos")
    SolicitacaoResponse toResponse(Solicitacao solicitacao);

    List<SolicitacaoResponse> toResponseList(List<Solicitacao> solicitacoes);

    ArquivoSolicitacaoResponse toArquivoResponse(ArquivoSolicitacao arquivo);

    List<ArquivoSolicitacaoResponse> toArquivoResponseList(List<ArquivoSolicitacao> arquivos);
}
