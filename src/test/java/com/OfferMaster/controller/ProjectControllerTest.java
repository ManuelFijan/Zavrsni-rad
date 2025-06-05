package com.OfferMaster.controller;

import com.OfferMaster.dto.ProjectCreateDto;
import com.OfferMaster.dto.ProjectDto;
import com.OfferMaster.dto.ProjectUpdateDto;
import com.OfferMaster.enums.ProjectStatus;
import com.OfferMaster.service.ProjectService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProjectController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProjectService projectService;

    @MockitoBean
    private com.OfferMaster.security.JwtUtil jwtUtil;

    private ProjectDto projectDto;

    @BeforeEach
    void setUp() {
        projectDto = new ProjectDto(
                1L,
                "Test Project",
                "123 Test St",
                ProjectStatus.AKTIVAN,
                "http://example.com/image.png",
                "Some notes",
                Instant.now(),
                Instant.now()
        );
    }

    @Test
    void createProject_shouldReturn201Created() throws Exception {
        ProjectCreateDto createDto = new ProjectCreateDto();
        createDto.setName("New Project");
        createDto.setAddress("456 New Ave");
        createDto.setStatus(ProjectStatus.AKTIVAN);

        given(projectService.createProject(any(ProjectCreateDto.class))).willReturn(projectDto);

        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(projectDto.getId()))
                .andExpect(jsonPath("$.name").value(projectDto.getName()));
    }

    @Test
    void getProjectById_whenProjectExists_shouldReturnProject() throws Exception {
        given(projectService.getProjectById(1L)).willReturn(projectDto);

        mockMvc.perform(get("/api/projects/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Test Project"));
    }

    @Test
    void getProjectById_whenProjectDoesNotExist_shouldReturn404NotFound() throws Exception {
        given(projectService.getProjectById(99L)).willThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

        mockMvc.perform(get("/api/projects/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAllUserProjects_shouldReturnListOfProjects() throws Exception {
        given(projectService.getAllUserProjects()).willReturn(List.of(projectDto));

        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    void updateProject_shouldReturn200Ok() throws Exception {
        ProjectUpdateDto updateDto = new ProjectUpdateDto();
        updateDto.setStatus(ProjectStatus.ZAVRSEN);
        updateDto.setNotes("Updated notes.");

        given(projectService.updateProject(eq(1L), any(ProjectUpdateDto.class))).willReturn(projectDto);

        mockMvc.perform(put("/api/projects/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void deleteProject_shouldReturn204NoContent() throws Exception {
        mockMvc.perform(delete("/api/projects/1"))
                .andExpect(status().isNoContent());
    }
}