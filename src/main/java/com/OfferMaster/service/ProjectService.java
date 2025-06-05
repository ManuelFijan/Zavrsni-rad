package com.OfferMaster.service;

import com.OfferMaster.dto.ProjectCreateDto;
import com.OfferMaster.dto.ProjectDto;
import com.OfferMaster.dto.ProjectUpdateDto;

import java.util.List;

public interface ProjectService {
    ProjectDto createProject(ProjectCreateDto projectCreateDto);

    ProjectDto getProjectById(Long projectId);

    List<ProjectDto> getAllUserProjects();

    ProjectDto updateProject(Long projectId, ProjectUpdateDto projectUpdateDto);

    void deleteProject(Long projectId);
}
