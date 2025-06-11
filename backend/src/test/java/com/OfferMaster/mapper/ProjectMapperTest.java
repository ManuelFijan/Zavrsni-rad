package com.OfferMaster.mapper;

import com.OfferMaster.dto.ProjectDto;
import com.OfferMaster.enums.ProjectStatus;
import com.OfferMaster.model.Project;
import com.OfferMaster.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

class ProjectMapperTest {

    private final ProjectMapper projectMapper = ProjectMapper.INSTANCE;
    private Project project;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setUserId(1L);
        user.setEmail("test@example.com");

        project = new Project();
        project.setId(100L);
        project.setName("Test Project");
        project.setAddress("123 Test Street");
        project.setStatus(ProjectStatus.AKTIVAN);
        project.setImageUrl("https://example.com/image.png");
        project.setNotes("Test project notes");
        project.setUser(user);
        project.setCreatedAt(LocalDateTime.of(2023, 1, 1, 10, 0).toInstant(ZoneOffset.UTC));
        project.setUpdatedAt(LocalDateTime.of(2023, 1, 2, 15, 30).toInstant(ZoneOffset.UTC));
    }

    @Test
    void toDto_withCompleteProject_shouldMapAllFields() {
        ProjectDto result = projectMapper.toDto(project);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(100L);
        assertThat(result.getName()).isEqualTo("Test Project");
        assertThat(result.getAddress()).isEqualTo("123 Test Street");
        assertThat(result.getStatus()).isEqualTo("Aktivan");
        assertThat(result.getImageUrl()).isEqualTo("https://example.com/image.png");
        assertThat(result.getNotes()).isEqualTo("Test project notes");

        assertThat(result.getCreatedAt()).isEqualTo("2023-01-01T10:00:00Z");
        assertThat(result.getUpdatedAt()).isEqualTo("2023-01-02T15:30:00Z");
    }

    @Test
    void toDto_withNullProject_shouldReturnNull() {
        ProjectDto result = projectMapper.toDto(null);

        assertThat(result).isNull();
    }

    @Test
    void toDto_withMinimalProject_shouldMapRequiredFields() {
        Project minimalProject = new Project();
        minimalProject.setId(200L);
        minimalProject.setName("Minimal Project");
        minimalProject.setStatus(ProjectStatus.ZAVRSEN);

        ProjectDto result = projectMapper.toDto(minimalProject);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(200L);
        assertThat(result.getName()).isEqualTo("Minimal Project");
        assertThat(result.getStatus()).isEqualTo("Završen");
        assertThat(result.getAddress()).isNull();
        assertThat(result.getImageUrl()).isNull();
        assertThat(result.getNotes()).isNull();
    }

    @Test
    void toDto_withNullStatus_shouldHandleGracefully() {
        project.setStatus(null);

        ProjectDto result = projectMapper.toDto(project);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isNull();
        assertThat(result.getName()).isEqualTo("Test Project");
    }

    @Test
    void toDto_withDifferentStatuses_shouldMapCorrectDisplayNames() {
        project.setStatus(ProjectStatus.AKTIVAN);
        ProjectDto result1 = projectMapper.toDto(project);
        assertThat(result1.getStatus()).isEqualTo("Aktivan");

        project.setStatus(ProjectStatus.ZAVRSEN);
        ProjectDto result2 = projectMapper.toDto(project);
        assertThat(result2.getStatus()).isEqualTo("Završen");

        project.setStatus(ProjectStatus.NA_CEKANJU);
        ProjectDto result3 = projectMapper.toDto(project);
        assertThat(result3.getStatus()).isEqualTo("Na čekanju");
    }
}