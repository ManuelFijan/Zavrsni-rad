package com.OfferMaster.controller;

import com.OfferMaster.dto.QuoteCreateDto;
import com.OfferMaster.dto.QuoteResponseDto;
import com.OfferMaster.security.JwtUtil;
import com.OfferMaster.service.EmailService;
import com.OfferMaster.service.QuoteService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(QuoteController.class)
@AutoConfigureMockMvc(addFilters = false)
class QuoteControllerTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    QuoteService quoteService;

    @MockitoBean
    EmailService emailService;

    @MockitoBean
    JwtUtil jwtUtil;

    @InjectMocks
    private QuoteController quoteController;

    @Test
    void createQuote_returnsId() throws Exception {
        when(quoteService.createQuote(any(QuoteCreateDto.class))).thenReturn(42L);

        String body = "{\"logoBase64\":null,\"items\":[{\"articleId\":1,\"quantity\":3}]}";

        mvc.perform(post("/api/quotes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(content().string("42"));
    }

    @Test
    void listQuotes_shouldReturnListOfQuotes() throws Exception {
        var quote1 = new QuoteResponseDto(
                1L,
                List.of(),
                Instant.now(),
                "http://example.com/logo.png",
                10,
                101L,
                "Test Project 1",
                "Description for quote 1"
        );

        var quote2 = new QuoteResponseDto(
                2L,
                List.of(),
                Instant.now(),
                null,
                0,
                null,
                null,
                "Description for quote 2"
        );

        given(quoteService.getAllQuotes()).willReturn(List.of(quote1, quote2));

        mvc.perform(get("/api/quotes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].projectName").value("Test Project 1"))
                .andExpect(jsonPath("$[1].id").value(2L))
                .andExpect(jsonPath("$[1].description").value("Description for quote 2"));
    }

    @Test
    void getQuote_shouldReturnSingleQuote() throws Exception {
        var quote1 = new QuoteResponseDto(
                1L,
                List.of(),
                Instant.now(),
                "http://example.com/logo.png",
                10,
                101L,
                "Test Project 1",
                "Description for quote 1"
        );

        given(quoteService.getQuoteById(1L)).willReturn(quote1);

        mvc.perform(get("/api/quotes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.projectName").value("Test Project 1"));
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

        mvc.perform(get("/api/quotes/1/pdf"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=quote-1.pdf"))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }

    @Test
    void sendQuoteByEmail_invokesEmailService() throws Exception {
        doNothing().when(emailService).sendQuoteEmail("a@b.com", "Name", 3L);

        mvc.perform(post("/api/quotes/3/email")
                        .param("recipientEmail", "a@b.com")
                        .param("recipientName", "Name"))
                .andExpect(status().isOk());

        verify(emailService).sendQuoteEmail("a@b.com", "Name", 3L);
    }
}
