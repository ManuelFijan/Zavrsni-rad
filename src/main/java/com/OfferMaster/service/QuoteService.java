package com.OfferMaster.service;

import com.OfferMaster.dto.QuoteCreateDto;
import com.OfferMaster.dto.QuoteResponseDto;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface QuoteService {
    Long createQuote(QuoteCreateDto dto);
    ResponseEntity<Resource> getQuotePdf(Long quoteId);
    QuoteResponseDto getQuoteById(Long id);
    List<QuoteResponseDto> getAllQuotes();
}
