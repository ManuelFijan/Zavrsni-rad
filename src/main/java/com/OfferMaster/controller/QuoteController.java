package com.OfferMaster.controller;

import com.OfferMaster.dto.QuoteCreateDto;
import com.OfferMaster.dto.QuoteResponseDto;
import com.OfferMaster.service.QuoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quotes")
public class QuoteController {

    @Autowired private QuoteService quoteService;

    @PostMapping
    public ResponseEntity<Long> createQuote(@RequestBody QuoteCreateDto dto) {
        Long id = quoteService.createQuote(dto);
        return ResponseEntity.ok(id);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> downloadPdf(@PathVariable Long id) {
        return quoteService.getQuotePdf(id);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuoteResponseDto> getQuote(@PathVariable Long id) {
        return ResponseEntity.ok(quoteService.getQuoteById(id));
    }

    @GetMapping
    public ResponseEntity<List<QuoteResponseDto>> listQuotes() {
        List<QuoteResponseDto> all = quoteService.getAllQuotes();
        return ResponseEntity.ok(all);
    }
}
