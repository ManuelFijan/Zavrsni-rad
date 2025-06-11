package com.OfferMaster.service;

import com.OfferMaster.dto.*;
import com.OfferMaster.enums.MeasureUnit;
import com.OfferMaster.mapper.QuoteMapper;
import com.OfferMaster.model.*;
import com.OfferMaster.repository.ArticleRepository;
import com.OfferMaster.repository.ProjectRepository;
import com.OfferMaster.repository.QuoteRepository;
import com.OfferMaster.repository.UserRepository;
import com.OfferMaster.service.impl.QuoteServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class QuoteServiceImplTest {

    @Mock
    private QuoteRepository quoteRepo;
    @Mock
    private ArticleRepository articleRepo;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private WebClient supabaseClient;
    @Mock
    private QuoteMapper quoteMapper;
    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;
    @Mock
    private WebClient.RequestBodyUriSpec requestBodyUriSpec;
    @Mock
    private WebClient.RequestBodySpec requestBodySpec;
    @Mock
    private WebClient.ResponseSpec responseSpec;

    @InjectMocks
    private QuoteServiceImpl service;

    private User testUser;
    private Quote testQuote;
    private QuoteResponseDto testQuoteDto;
    private Article testArticle;
    private Project testProject;

    @BeforeEach
    void setup() {
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        testUser = new User();
        testUser.setUserId(1L);
        testUser.setEmail("test@example.com");

        testArticle = new Article();
        testArticle.setArticleId(100L);
        testArticle.setName("Test Article");
        testArticle.setPrice(50.0);
        testArticle.setMeasureUnit(MeasureUnit.KOM);

        testProject = new Project();
        testProject.setId(200L);
        testProject.setName("Test Project");
        testProject.setUser(testUser);

        testQuote = new Quote();
        testQuote.setId(1L);
        testQuote.setUser(testUser);
        testQuote.setItems(Collections.emptyList());
        testQuote.setCreatedAt(Instant.now());

        testQuoteDto = new QuoteResponseDto();
        testQuoteDto.setId(1L);
        testQuoteDto.setItems(Collections.emptyList());
        testQuoteDto.setCreatedAt(Instant.now());

        when(authentication.getName()).thenReturn(testUser.getEmail());
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

        ReflectionTestUtils.setField(service, "supabaseUrl", "https://test.supabase.co");
    }

    @Test
    void currentUser_userNotFound_shouldThrow() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.currentUser());

        assertTrue(ex.getReason().contains("User not found"));
    }

    @Test
    void createQuote_withLogoAndProject_shouldUploadAndSave() {
        setupMockWebClient();

        QuoteItemRequestDto itemDto = new QuoteItemRequestDto();
        itemDto.setArticleId(100L);
        itemDto.setQuantity(2);

        QuoteCreateDto dto = new QuoteCreateDto();
        dto.setLogoBase64("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==");
        dto.setItems(Collections.singletonList(itemDto));
        dto.setProjectId(200L);

        when(articleRepo.findById(100L)).thenReturn(Optional.of(testArticle));
        when(projectRepository.findById(200L)).thenReturn(Optional.of(testProject));
        when(quoteRepo.save(any(Quote.class))).thenAnswer(inv -> {
            Quote q = inv.getArgument(0);
            q.setId(1L);
            return q;
        });

        Long id = service.createQuote(dto);

        assertEquals(1L, id);
        verify(supabaseClient).post();
        verify(quoteRepo).save(any(Quote.class));
    }

    @Test
    void createQuote_projectNotBelongingToUser_shouldThrow() {
        User otherUser = new User();
        otherUser.setUserId(999L);
        testProject.setUser(otherUser);

        QuoteItemRequestDto itemDto = new QuoteItemRequestDto();
        itemDto.setArticleId(100L);
        itemDto.setQuantity(1);

        QuoteCreateDto dto = new QuoteCreateDto();
        dto.setItems(Collections.singletonList(itemDto));
        dto.setProjectId(200L);

        when(articleRepo.findById(100L)).thenReturn(Optional.of(testArticle));
        when(projectRepository.findById(200L)).thenReturn(Optional.of(testProject));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.createQuote(dto));

        assertTrue(ex.getReason().contains("nije pronađen ili nije dostupan"));
    }

    @Test
    void createQuote_projectNotFound_shouldThrow() {
        QuoteItemRequestDto itemDto = new QuoteItemRequestDto();
        itemDto.setArticleId(100L);
        itemDto.setQuantity(1);

        QuoteCreateDto dto = new QuoteCreateDto();
        dto.setItems(Collections.singletonList(itemDto));
        dto.setProjectId(999L);

        when(articleRepo.findById(100L)).thenReturn(Optional.of(testArticle));
        when(projectRepository.findById(999L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.createQuote(dto));

        assertTrue(ex.getReason().contains("nije pronađen"));
    }

    @Test
    void createQuote_supabaseUploadFails_shouldThrow() {
        QuoteItemRequestDto itemDto = new QuoteItemRequestDto();
        itemDto.setArticleId(100L);
        itemDto.setQuantity(1);

        QuoteCreateDto dto = new QuoteCreateDto();
        dto.setLogoBase64("data:image/png;base64,test");
        dto.setItems(Collections.singletonList(itemDto));

        when(articleRepo.findById(100L)).thenReturn(Optional.of(testArticle));

        when(supabaseClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(any(java.util.function.Function.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(any())).thenReturn(requestBodySpec);
        when(requestBodySpec.bodyValue(any())).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.onStatus(any(), any())).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(Void.class)).thenReturn(Mono.error(new RuntimeException("Upload failed")));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.createQuote(dto));

        assertTrue(ex.getMessage().contains("Upload failed"));
    }

    @Test
    void getQuoteById_withProject_shouldReturnDtoWithProjectInfo() {
        testQuote.setProject(testProject);
        testQuote.setDiscount(5);
        testQuote.setDescription("Test description");

        QuoteResponseDto expectedDto = new QuoteResponseDto();
        expectedDto.setId(1L);
        expectedDto.setProjectId(200L);
        expectedDto.setProjectName("Test Project");
        expectedDto.setDiscount(5);
        expectedDto.setDescription("Test description");

        when(quoteRepo.findById(1L)).thenReturn(Optional.of(testQuote));
        when(quoteMapper.toDto(testQuote)).thenReturn(expectedDto);

        QuoteResponseDto result = service.getQuoteById(1L);

        assertEquals(1L, result.getId());
        assertEquals(200L, result.getProjectId());
        assertEquals("Test Project", result.getProjectName());
        assertEquals(5, result.getDiscount());
        assertEquals("Test description", result.getDescription());
    }

    @Test
    void getQuoteById_withoutProject_shouldReturnDtoWithNullProject() {
        Quote quote = new Quote();
        quote.setId(1L);
        quote.setUser(testUser);
        quote.setProject(null);
        quote.setItems(new ArrayList<>());
        quote.setCreatedAt(Instant.now());

        QuoteResponseDto expectedDto = new QuoteResponseDto();
        expectedDto.setId(1L);
        expectedDto.setProjectId(null);
        expectedDto.setProjectName(null);

        when(quoteRepo.findById(1L)).thenReturn(Optional.of(quote));
        when(quoteMapper.toDto(quote)).thenReturn(expectedDto);

        QuoteResponseDto result = service.getQuoteById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getProjectId()).isNull();
        assertThat(result.getProjectName()).isNull();
    }

    @Test
    void getAllQuotes_shouldReturnAllUserQuotes() {
        Quote quote1 = new Quote();
        quote1.setId(1L);
        quote1.setUser(testUser);
        quote1.setItems(new ArrayList<>());
        quote1.setCreatedAt(Instant.now());

        Quote quote2 = new Quote();
        quote2.setId(2L);
        quote2.setUser(testUser);
        quote2.setProject(testProject);
        quote2.setItems(new ArrayList<>());
        quote2.setCreatedAt(Instant.now());

        QuoteResponseDto dto1 = new QuoteResponseDto();
        dto1.setId(1L);
        dto1.setProjectId(null);

        QuoteResponseDto dto2 = new QuoteResponseDto();
        dto2.setId(2L);
        dto2.setProjectId(200L);

        when(quoteRepo.findByUser(testUser)).thenReturn(Arrays.asList(quote1, quote2));
        when(quoteMapper.toDto(quote1)).thenReturn(dto1);
        when(quoteMapper.toDto(quote2)).thenReturn(dto2);

        List<QuoteResponseDto> result = service.getAllQuotes();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(1).getId()).isEqualTo(2L);
        assertThat(result.get(0).getProjectId()).isNull();
        assertThat(result.get(1).getProjectId()).isEqualTo(200L);
    }

    @Test
    void getQuotePdf_quoteWithItems_shouldGeneratePdf() {
        QuoteItem item = new QuoteItem();
        item.setArticle(testArticle);
        item.setQuantity(3);

        Quote quote = new Quote();
        quote.setId(1L);
        quote.setUser(testUser);
        quote.setItems(Collections.singletonList(item));
        quote.setCreatedAt(Instant.now());
        quote.setDiscount(0);

        when(quoteRepo.findById(1L)).thenReturn(Optional.of(quote));

        ResponseEntity<Resource> result = service.getQuotePdf(1L);

        assertNotNull(result);
        assertTrue(result.getStatusCode().is2xxSuccessful());
        assertNotNull(result.getBody());
    }

    @Test
    void getQuotePdf_quoteWithLogoAndDiscount_shouldGeneratePdf() throws IOException {
        QuoteItem item = new QuoteItem();
        item.setArticle(testArticle);
        item.setQuantity(2);

        Quote quote = new Quote();
        quote.setId(1L);
        quote.setUser(testUser);
        quote.setItems(Collections.singletonList(item));
        quote.setCreatedAt(Instant.now());
        quote.setDiscount(15);
        quote.setLogoUrl("https://example.com/logo.png");
        quote.setDescription("Quote with logo and discount");

        BufferedImage bImage = new BufferedImage(1, 1, BufferedImage.TYPE_INT_ARGB);
        File tmpFile = File.createTempFile("test-logo", ".png");
        tmpFile.deleteOnExit();
        ImageIO.write(bImage, "png", tmpFile);
        quote.setLogoUrl(tmpFile.toURI().toURL().toString());

        when(quoteRepo.findById(1L)).thenReturn(Optional.of(quote));

        ResponseEntity<Resource> result = service.getQuotePdf(1L);

        assertNotNull(result);
        assertTrue(result.getStatusCode().is2xxSuccessful());
        assertNotNull(result.getBody());
    }

    @Test
    void createQuote_withoutLogo_savesQuoteAndReturnsId() {
        QuoteItemRequestDto itemDto = new QuoteItemRequestDto();
        itemDto.setArticleId(100L);
        itemDto.setQuantity(2);

        QuoteCreateDto dto = new QuoteCreateDto();
        dto.setLogoBase64(null);
        dto.setItems(Collections.singletonList(itemDto));

        when(articleRepo.findById(100L)).thenReturn(Optional.of(testArticle));
        when(quoteRepo.save(any(Quote.class))).thenAnswer(inv -> {
            Quote q = inv.getArgument(0);
            q.setId(1L);
            return q;
        });

        Long id = service.createQuote(dto);
        assertEquals(1L, id);
        verify(quoteRepo).save(any(Quote.class));
    }

    @Test
    void createQuote_articleNotFound_throwsException() {
        QuoteItemRequestDto itemDto = new QuoteItemRequestDto();
        itemDto.setArticleId(999L);
        itemDto.setQuantity(1);

        QuoteCreateDto dto = new QuoteCreateDto();
        dto.setLogoBase64(null);
        dto.setItems(Collections.singletonList(itemDto));

        when(articleRepo.findById(999L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.createQuote(dto));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void getQuoteById_notFound_throwsException() {
        when(quoteRepo.findById(anyLong())).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class,
                () -> service.getQuoteById(5L));
    }

    @Test
    void getQuoteById_whenBelongsToDifferentUser_throwsException() {
        User differentUser = new User();
        differentUser.setUserId(99L);

        Quote quote = new Quote();
        quote.setId(5L);
        quote.setUser(differentUser);

        when(quoteRepo.findById(5L)).thenReturn(Optional.of(quote));

        assertThrows(ResponseStatusException.class,
                () -> service.getQuoteById(5L));
    }


    @Test
    void getAllQuotes_returnsListOfQuotes() {
        when(quoteRepo.findByUser(testUser)).thenReturn(List.of(testQuote));
        when(quoteMapper.toDto(testQuote)).thenReturn(testQuoteDto);

        List<QuoteResponseDto> result = service.getAllQuotes();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        verify(quoteMapper).toDto(testQuote);
    }

    @Test
    void getQuotePdf_notFound_throwsException() {
        when(quoteRepo.findById(10L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class,
                () -> service.getQuotePdf(10L));
    }

    @Test
    void getQuoteById_shouldReturnDto() {
        when(quoteRepo.findById(1L)).thenReturn(Optional.of(testQuote));
        when(quoteMapper.toDto(testQuote)).thenReturn(testQuoteDto);

        QuoteResponseDto result = service.getQuoteById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(quoteMapper).toDto(testQuote);
    }

    @Test
    void getAllQuotes_shouldReturnDtoList() {
        when(quoteRepo.findByUser(testUser)).thenReturn(List.of(testQuote));
        when(quoteMapper.toDto(testQuote)).thenReturn(testQuoteDto);

        List<QuoteResponseDto> result = service.getAllQuotes();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        verify(quoteMapper).toDto(testQuote);
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