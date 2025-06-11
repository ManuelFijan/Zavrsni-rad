package com.OfferMaster.service;

import com.OfferMaster.dto.ProjectCreateDto;
import com.OfferMaster.dto.ProjectDto;
import com.OfferMaster.dto.ProjectUpdateDto;
import com.OfferMaster.enums.ProjectStatus;
import com.OfferMaster.mapper.ProjectMapper;
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
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.time.Instant;
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
    @Mock
    private WebClient supabaseClient;
    @Mock
    private ProjectMapper projectMapper;
    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;
    @Mock
    private WebClient.RequestBodyUriSpec requestBodyUriSpec;
    @Mock
    private WebClient.RequestBodySpec requestBodySpec;
    @Mock
    private WebClient.ResponseSpec responseSpec;

    @InjectMocks
    private ProjectServiceImpl projectService;

    private User testUser;
    private Project testProject;
    private ProjectDto testProjectDto;

    @BeforeEach
    void setUp() {
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        testUser = new User();
        testUser.setUserId(1L);
        testUser.setEmail("test@example.com");

        testProject = new Project();
        testProject.setId(1L);
        testProject.setName("Test Project");
        testProject.setUser(testUser);
        testProject.setStatus(ProjectStatus.AKTIVAN);
        testProject.setCreatedAt(Instant.now());
        testProject.setUpdatedAt(Instant.now());

        testProjectDto = new ProjectDto();
        testProjectDto.setId(1L);
        testProjectDto.setName("Test Project");
        testProjectDto.setStatus("Aktivan");

        when(authentication.getName()).thenReturn(testUser.getEmail());
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));

        ReflectionTestUtils.setField(projectService, "supabaseUrl", "https://test.supabase.co");
    }

    @Test
    void getCurrentUser_userNotFound_shouldThrow() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> {
            ProjectCreateDto dto = new ProjectCreateDto();
            projectService.createProject(dto);
        }).isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("nije autentificiran");
    }

    @Test
    void createProject_withBase64Image_shouldUploadAndSave() {
        ProjectCreateDto createDto = new ProjectCreateDto();
        createDto.setName("Project with Image");
        createDto.setAddress("Test Address");
        createDto.setStatus(ProjectStatus.AKTIVAN);
        createDto.setNotes("Test notes");
        createDto.setImageUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==");

        setupMockWebClient();

        Project savedProject = new Project();
        savedProject.setId(1L);
        savedProject.setName(createDto.getName());
        savedProject.setAddress(createDto.getAddress());
        savedProject.setUser(testUser);
        savedProject.setStatus(createDto.getStatus());
        savedProject.setNotes(createDto.getNotes());
        savedProject.setImageUrl("https://test.supabase.co/storage/v1/object/public/project-images-bucket/projects/123456.png");
        savedProject.setCreatedAt(Instant.now());
        savedProject.setUpdatedAt(Instant.now());

        ProjectDto expectedDto = new ProjectDto();
        expectedDto.setId(1L);
        expectedDto.setName("Project with Image");
        expectedDto.setAddress("Test Address");
        expectedDto.setNotes("Test notes");
        expectedDto.setImageUrl("https://test.supabase.co/storage/v1/object/public/project-images-bucket/projects/123456.png");

        when(projectRepository.save(any(Project.class))).thenReturn(savedProject);
        when(projectMapper.toDto(savedProject)).thenReturn(expectedDto);

        ProjectDto result = projectService.createProject(createDto);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Project with Image");
        assertThat(result.getAddress()).isEqualTo("Test Address");
        assertThat(result.getNotes()).isEqualTo("Test notes");
        assertThat(result.getImageUrl()).isNotNull();
        verify(supabaseClient).post();
        verify(projectMapper).toDto(savedProject);
    }

    @Test
    void createProject_withoutImage_shouldSaveWithoutUpload() {
        ProjectCreateDto createDto = new ProjectCreateDto();
        createDto.setName("Project without Image");
        createDto.setStatus(ProjectStatus.AKTIVAN);

        when(projectRepository.save(any(Project.class))).thenReturn(testProject);
        when(projectMapper.toDto(testProject)).thenReturn(testProjectDto);

        ProjectDto result = projectService.createProject(createDto);

        assertThat(result).isNotNull();
        verify(supabaseClient, never()).post();
        verify(projectMapper).toDto(testProject);
    }

    @Test
    void createProject_emptyImageUrl_shouldNotUpload() {
        ProjectCreateDto createDto = new ProjectCreateDto();
        createDto.setName("Project");
        createDto.setImageUrl("");
        createDto.setStatus(ProjectStatus.AKTIVAN);

        when(projectRepository.save(any(Project.class))).thenReturn(testProject);
        when(projectMapper.toDto(testProject)).thenReturn(testProjectDto);

        ProjectDto result = projectService.createProject(createDto);

        assertThat(result).isNotNull();
        verify(supabaseClient, never()).post();
        verify(projectMapper).toDto(testProject);
    }

    @Test
    void createProject_shouldSaveAndReturnDto() {
        ProjectCreateDto createDto = new ProjectCreateDto();
        createDto.setName("New Project");
        createDto.setStatus(ProjectStatus.AKTIVAN);

        when(projectRepository.save(any(Project.class))).thenReturn(testProject);
        when(projectMapper.toDto(testProject)).thenReturn(testProjectDto);

        ProjectDto result = projectService.createProject(createDto);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(projectRepository).save(any(Project.class));
        verify(projectMapper).toDto(testProject);
    }

    @Test
    void getProjectById_whenBelongsToUser_shouldReturnDto() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(projectMapper.toDto(testProject)).thenReturn(testProjectDto);

        ProjectDto result = projectService.getProjectById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(projectMapper).toDto(testProject);
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
        when(projectRepository.findByUserOrderByNameAsc(testUser)).thenReturn(List.of(testProject));
        when(projectMapper.toDto(testProject)).thenReturn(testProjectDto);

        List<ProjectDto> results = projectService.getAllUserProjects();

        assertThat(results).isNotNull().hasSize(1);
        assertThat(results.get(0).getId()).isEqualTo(1L);
        verify(projectMapper).toDto(testProject);
    }

    @Test
    void updateProject_shouldUpdateAndReturnDto() {
        ProjectUpdateDto updateDto = new ProjectUpdateDto();
        updateDto.setName("Updated Project");

        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);
        when(projectMapper.toDto(testProject)).thenReturn(testProjectDto);

        ProjectDto result = projectService.updateProject(1L, updateDto);

        assertThat(result).isNotNull();
        verify(projectRepository).save(testProject);
        verify(projectMapper).toDto(testProject);
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

    private void setupMockWebClient() {
        when(supabaseClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(any(java.util.function.Function.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(any())).thenReturn(requestBodySpec);
        when(requestBodySpec.bodyValue(any())).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.onStatus(any(), any())).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(Void.class)).thenReturn(Mono.empty());
    }
}