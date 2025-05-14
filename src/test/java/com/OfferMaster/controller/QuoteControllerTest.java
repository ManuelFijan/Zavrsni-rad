package com.OfferMaster.controller;

import com.OfferMaster.dto.QuoteCreateDto;
import com.OfferMaster.dto.QuoteResponseDto;
import com.OfferMaster.service.EmailService;
import com.OfferMaster.service.QuoteService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class QuoteControllerTest {

    private MockMvc mockMvc;

    @Mock
    private QuoteService quoteService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private QuoteController quoteController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(quoteController)
                .build();
    }

    @Test
    void createQuote_returnsId() throws Exception {
        when(quoteService.createQuote(any(QuoteCreateDto.class))).thenReturn(42L);

        String body = "{\"logoBase64\":null,\"items\":[{\"articleId\":1,\"quantity\":3}]}";

        mockMvc.perform(post("/api/quotes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(content().string("42"));
    }

    @Test
    void listQuotes_returnsList() throws Exception {
        QuoteResponseDto dto1 = new QuoteResponseDto(1L, Collections.emptyList(), null, null);
        QuoteResponseDto dto2 = new QuoteResponseDto(2L, Collections.emptyList(), null, null);
        when(quoteService.getAllQuotes()).thenReturn(Arrays.asList(dto1, dto2));

        mockMvc.perform(get("/api/quotes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[1].id").value(2));
    }

    @Test
    void getQuote_returnsDto() throws Exception {
        QuoteResponseDto dto = new QuoteResponseDto(5L, Collections.emptyList(), null, null);
        when(quoteService.getQuoteById(5L)).thenReturn(dto);

        mockMvc.perform(get("/api/quotes/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5));
    }

    @Test
    void downloadPdf_returnsPdfResource() throws Exception {
        byte[] data = "PDF".getBytes(StandardCharsets.UTF_8);
        Resource resource = new ByteArrayResource(data);
        ResponseEntity<Resource> resp = ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=quote-1.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
        when(quoteService.getQuotePdf(1L)).thenReturn(resp);

        mockMvc.perform(get("/api/quotes/1/pdf"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=quote-1.pdf"))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }

    @Test
    void sendQuoteByEmail_invokesEmailService() throws Exception {
        doNothing().when(emailService).sendQuoteEmail("a@b.com", "Name", 3L);

        mockMvc.perform(post("/api/quotes/3/email")
                        .param("recipientEmail", "a@b.com")
                        .param("recipientName", "Name"))
                .andExpect(status().isOk());

        verify(emailService).sendQuoteEmail("a@b.com", "Name", 3L);
    }
}
