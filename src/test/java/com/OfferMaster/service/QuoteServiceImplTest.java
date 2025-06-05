package com.OfferMaster.service;

import com.OfferMaster.dto.*;
import com.OfferMaster.model.Article;
import com.OfferMaster.model.Quote;
import com.OfferMaster.model.User;
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
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

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

    @InjectMocks
    private QuoteServiceImpl service;

    private User testUser;

    @BeforeEach
    void setup() {
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        testUser = new User();
        testUser.setUserId(1L);
        testUser.setEmail("test@example.com");

        when(authentication.getName()).thenReturn(testUser.getEmail());
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
    }

    @Test
    void createQuote_withoutLogo_savesQuoteAndReturnsId() {
        QuoteItemRequestDto itemDto = new QuoteItemRequestDto();
        itemDto.setArticleId(100L);
        itemDto.setQuantity(2);

        QuoteCreateDto dto = new QuoteCreateDto();
        dto.setLogoBase64(null);
        dto.setItems(Collections.singletonList(itemDto));

        Article art = new Article();
        art.setArticleId(100L);
        art.setName("TestArticle");
        art.setPrice(10.0);
        when(articleRepo.findById(100L)).thenReturn(Optional.of(art));

        when(quoteRepo.save(any(Quote.class))).thenAnswer(inv -> {
            Quote q = inv.getArgument(0);
            q.setId(1L);
            return q;
        });

        Long id = service.createQuote(dto);
        assertEquals(1L, id);
        verify(quoteRepo, times(1)).save(any(Quote.class));
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
        Quote quote = new Quote();
        quote.setId(1L);
        quote.setCreatedAt(Instant.now());
        quote.setUser(testUser);
        quote.setItems(Collections.emptyList());

        when(quoteRepo.findByUser(testUser)).thenReturn(List.of(quote));

        List<QuoteResponseDto> result = service.getAllQuotes();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }

    @Test
    void getQuotePdf_notFound_throwsException() {
        when(quoteRepo.findById(10L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class,
                () -> service.getQuotePdf(10L));
    }
}