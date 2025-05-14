package com.OfferMaster.service;

import com.OfferMaster.dto.QuoteCreateDto;
import com.OfferMaster.dto.QuoteItemRequestDto;
import com.OfferMaster.model.Article;
import com.OfferMaster.model.Quote;
import com.OfferMaster.repository.ArticleRepository;
import com.OfferMaster.repository.QuoteRepository;
import com.OfferMaster.service.impl.QuoteServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import java.util.Collections;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuoteServiceImplTest {

    @Mock
    private QuoteRepository quoteRepo;

    @Mock
    private ArticleRepository articleRepo;

    @Mock
    private WebClient supabaseClient;

    @InjectMocks
    private QuoteServiceImpl service;

    @BeforeEach
    void setup() {

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
        assertTrue(ex.getStatusCode().is4xxClientError());
    }

    @Test
    void getQuoteById_notFound_throwsException() {
        when(quoteRepo.findById(5L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class,
                () -> service.getQuoteById(5L));
    }

    @Test
    void getAllQuotes_returnsEmptyList() {
        when(quoteRepo.findAll()).thenReturn(Collections.emptyList());
        assertTrue(service.getAllQuotes().isEmpty());
    }

    @Test
    void getQuotePdf_notFound_throwsException() {
        when(quoteRepo.findById(10L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class,
                () -> service.getQuotePdf(10L));
    }
}
