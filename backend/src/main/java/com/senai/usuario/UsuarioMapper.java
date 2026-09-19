package com.senai.usuario;

import com.senai.usuario.dto.CriarUsuarioRequest;
import com.senai.usuario.dto.UsuarioResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 15/09/2026
 * @brief Interface UsuarioMapper
 */
@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface UsuarioMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "senhaHash", ignore = true)
    @Mapping(target = "ativo", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    Usuario toEntity(CriarUsuarioRequest request);

    UsuarioResponse toResponse(Usuario usuario);
}
