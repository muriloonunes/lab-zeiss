package com.senai.notificacao;

import com.senai.notificacao.domain.Notificacao;
import com.senai.notificacao.dto.NotificacaoResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 22/09/2026
 * @brief Interface NotificacaoMapper
 */
@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface NotificacaoMapper {
    NotificacaoResponse toResponse(Notificacao notificacao);
}
