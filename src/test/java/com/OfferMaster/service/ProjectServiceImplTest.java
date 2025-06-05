package com.OfferMaster.service;

import com.OfferMaster.dto.ProjectCreateDto;
import com.OfferMaster.dto.ProjectDto;
import com.OfferMaster.dto.ProjectUpdateDto;
import com.OfferMaster.enums.ProjectStatus;
import com.OfferMaster.model.Project;
import com.OfferMaster.model.User;
import com.OfferMaster.repository.ProjectRepository;
import com.OfferMaster.repository.QuoteRepository;
import com.OfferMaster.repository.UserRepository;
import com.OfferMaster.service.impl.ProjectServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProjectServiceImplTest {

    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private QuoteRepository quoteRepository;

    @InjectMocks
    private ProjectServiceImpl projectService;

    private User testUser;

    @BeforeEach
    void setUp() {
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        testUser = new User();
        testUser.setUserId(1L);
        testUser.setEmail("test@example.com");

        when(authentication.getName()).thenReturn(testUser.getEmail());
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
    }

    @Test
    void createProject_shouldSaveAndReturnDto() {
        ProjectCreateDto createDto = new ProjectCreateDto();
        createDto.setName("Novi Projekt");
        createDto.setAddress("Adresa 123");
        createDto.setStatus(ProjectStatus.AKTIVAN);

        Project savedProject = new Project();
        savedProject.setId(1L);
        savedProject.setName(createDto.getName());
        savedProject.setUser(testUser);
        savedProject.setStatus(createDto.getStatus());


        when(projectRepository.save(any(Project.class))).thenReturn(savedProject);

        ProjectDto result = projectService.createProject(createDto);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo(createDto.getName());
        verify(projectRepository, times(1)).save(any(Project.class));
    }

    @Test
    void getProjectById_whenBelongsToUser_shouldReturnDto() {
        Project project = new Project();
        project.setId(1L);
        project.setUser(testUser);
        project.setStatus(ProjectStatus.AKTIVAN);

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        ProjectDto result = projectService.getProjectById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void getProjectById_whenBelongsToAnotherUser_shouldThrowForbidden() {
        User otherUser = new User();
        otherUser.setUserId(99L);

        Project project = new Project();
        project.setId(1L);
        project.setUser(otherUser);

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        assertThatThrownBy(() -> projectService.getProjectById(1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Pristup odbijen");
    }

    @Test
    void getAllUserProjects_shouldReturnDtoList() {
        Project project = new Project();
        project.setId(1L);
        project.setUser(testUser);
        project.setStatus(ProjectStatus.AKTIVAN);

        when(projectRepository.findByUserOrderByNameAsc(testUser)).thenReturn(List.of(project));

        List<ProjectDto> results = projectService.getAllUserProjects();

        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getId()).isEqualTo(1L);
    }

    @Test
    void updateProject_shouldUpdateAndReturnDto() {
        Project existingProject = new Project();
        existingProject.setId(1L);
        existingProject.setName("Stari Naziv");
        existingProject.setUser(testUser);
        existingProject.setStatus(ProjectStatus.AKTIVAN);

        ProjectUpdateDto updateDto = new ProjectUpdateDto();
        updateDto.setName("Novi Naziv");
        updateDto.setStatus(ProjectStatus.ZAVRSEN);

        when(projectRepository.findById(1L)).thenReturn(Optional.of(existingProject));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProjectDto result = projectService.updateProject(1L, updateDto);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Novi Naziv");
        assertThat(result.getStatus()).isEqualTo(ProjectStatus.ZAVRSEN.getDisplayName());
        verify(projectRepository, times(1)).save(any(Project.class));
    }

    @Test
    void deleteProject_shouldDisassociateQuotesAndDelete() {
        Project project = new Project();
        project.setId(1L);
        project.setUser(testUser);
        project.setQuotes(Collections.emptyList());

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        doNothing().when(projectRepository).delete(project);

        projectService.deleteProject(1L);

        verify(quoteRepository, never()).save(any());
        verify(projectRepository, times(1)).delete(project);
    }
}