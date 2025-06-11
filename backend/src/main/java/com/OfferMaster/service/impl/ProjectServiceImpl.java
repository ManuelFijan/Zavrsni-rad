package com.OfferMaster.service.impl;

import com.OfferMaster.dto.ProjectCreateDto;
import com.OfferMaster.dto.ProjectDto;
import com.OfferMaster.dto.ProjectUpdateDto;
import com.OfferMaster.mapper.ProjectMapper;
import com.OfferMaster.model.Project;
import com.OfferMaster.model.User;
import com.OfferMaster.repository.ProjectRepository;
import com.OfferMaster.repository.QuoteRepository;
import com.OfferMaster.repository.UserRepository;
import com.OfferMaster.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectServiceImpl implements ProjectService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final QuoteRepository quoteRepository;
    private final WebClient supabaseClient;
    private final ProjectMapper projectMapper;

    @Autowired
    public ProjectServiceImpl(ProjectRepository projectRepository,
                              UserRepository userRepository,
                              QuoteRepository quoteRepository,
                              WebClient supabaseClient, ProjectMapper projectMapper) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.quoteRepository = quoteRepository;
        this.supabaseClient = supabaseClient;
        this.projectMapper = projectMapper;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Korisnik nije autentificiran"));
    }

    private String uploadImageToSupabase(String base64Image, String entityPath) {
        if (base64Image == null || base64Image.isBlank()) {
            return null;
        }
        String cleanBase64 = base64Image;
        int comma = base64Image.indexOf(',');
        if (comma >= 0) {
            cleanBase64 = base64Image.substring(comma + 1);
        }
        byte[] imageBytes = Base64.getDecoder().decode(cleanBase64);
        String path = entityPath + "/" + System.currentTimeMillis() + ".png";

        supabaseClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/object/{bucket}/{path}")
                        .build("project-images-bucket", path))
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .bodyValue(imageBytes)
                .retrieve()
                .onStatus(
                        HttpStatusCode::isError,
                        clientResponse -> clientResponse.bodyToMono(String.class)
                                .flatMap(errorBody -> Mono.error(new RuntimeException("Supabase upload failed for project image: " + errorBody)))
                )
                .bodyToMono(Void.class)
                .block();

        return supabaseUrl + "/storage/v1/object/public/project-images-bucket/" + path;
    }


    @Override
    @Transactional
    public ProjectDto createProject(ProjectCreateDto dto) {
        User currentUser = getCurrentUser();
        Project project = new Project();
        project.setUser(currentUser);
        project.setName(dto.getName());
        project.setAddress(dto.getAddress());
        project.setStatus(dto.getStatus());
        project.setNotes(dto.getNotes());

        if (StringUtils.hasText(dto.getImageUrl())) {
            String imageUrl = uploadImageToSupabase(dto.getImageUrl(), "projects");
            project.setImageUrl(imageUrl);
        }

        Project savedProject = projectRepository.save(project);
        return projectMapper.toDto(savedProject);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectDto getProjectById(Long projectId) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Projekt nije pronađen"));
        if (!project.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Pristup odbijen");
        }
        return projectMapper.toDto(project);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectDto> getAllUserProjects() {
        User currentUser = getCurrentUser();
        return projectRepository.findByUserOrderByNameAsc(currentUser).stream()
                .map(projectMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProjectDto updateProject(Long projectId, ProjectUpdateDto dto) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Projekt nije pronađen"));

        if (!project.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Pristup odbijen");
        }

        if (dto.getName() != null) project.setName(dto.getName());
        if (dto.getAddress() != null) project.setAddress(dto.getAddress());
        if (dto.getStatus() != null) project.setStatus(dto.getStatus());
        if (dto.getNotes() != null) project.setNotes(dto.getNotes());

        if (Boolean.TRUE.equals(dto.getRemoveImage())) {
            project.setImageUrl(null);
        } else if (StringUtils.hasText(dto.getImageUrl())) {
            String newImageUrl = uploadImageToSupabase(dto.getImageUrl(), "projects");
            project.setImageUrl(newImageUrl);
        }


        Project updatedProject = projectRepository.save(project);
        return projectMapper.toDto(updatedProject);
    }

    @Override
    @Transactional
    public void deleteProject(Long projectId) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project nije pronađen"));

        if (!project.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Pristup odbijen");
        }

        project.getQuotes().forEach(quote -> {
            quote.setProject(null);
            quoteRepository.save(quote);
        });
        project.getQuotes().clear();

        projectRepository.delete(project);
    }
}