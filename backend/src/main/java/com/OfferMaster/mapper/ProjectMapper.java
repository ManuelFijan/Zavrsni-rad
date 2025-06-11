package com.OfferMaster.mapper;

import com.OfferMaster.dto.ProjectDto;
import com.OfferMaster.model.Project;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ProjectMapper {
    ProjectMapper INSTANCE = Mappers.getMapper(ProjectMapper.class);

    @Mapping(target = "status", expression = "java(project.getStatus() != null ? project.getStatus().getDisplayName() : null)")
    ProjectDto toDto(Project project);
}