package com.senai.vocabulario;

import com.senai.vocabulario.dto.ClasseResponse;
import com.senai.vocabulario.dto.TermoResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

/**
 *
 * @author Murilo Nunes <murilo_no@outlook.com>
 * @date 18/09/2026
 * @brief Interface VocabularioMapper
 */
@Mapper(componentModel = MappingConstants.ComponentModel.CDI)
public interface VocabularioMapper {
    ClasseResponse toResponse(ClasseVocabulario entity);

    List<ClasseResponse> toClasseResponseList(List<ClasseVocabulario> entities);

    @Mapping(target = "classeId", source = "classe.id")
    TermoResponse toResponse(TermoVocabulario entity);

    List<TermoResponse> toTermoResponseList(List<TermoVocabulario> entities);
}
