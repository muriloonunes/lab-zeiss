package com.senai.servico;

import com.senai.servico.domain.RegistroServico;
import com.senai.servico.dto.ServicoResponse;
import com.senai.usuario.UsuarioMapper;
import com.senai.vocabulario.VocabularioMapper;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import java.util.List;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 21/09/2026
 * @brief Interface ServicoMapper
 */
@Mapper(componentModel = MappingConstants.ComponentModel.JAKARTA_CDI, uses = {VocabularioMapper.class, UsuarioMapper.class})
public interface ServicoMapper {

    ServicoResponse toResponse(RegistroServico registroServico);

    List<ServicoResponse> toResponseList(List<RegistroServico> registros);
}