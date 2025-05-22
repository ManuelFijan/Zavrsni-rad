package com.OfferMaster.service.impl;

import com.OfferMaster.dto.*;
import com.OfferMaster.model.*;
import com.OfferMaster.repository.*;
import com.OfferMaster.service.QuoteService;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class QuoteServiceImpl implements QuoteService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    private final QuoteRepository quoteRepo;
    private final ArticleRepository articleRepo;
    private final WebClient supabaseClient;
    private final UserRepository userRepository;

    @Autowired
    public QuoteServiceImpl(
            QuoteRepository quoteRepo,
            ArticleRepository articleRepo,
            WebClient supabaseClient, UserRepository userRepository
    ) {
        this.quoteRepo = quoteRepo;
        this.articleRepo = articleRepo;
        this.supabaseClient = supabaseClient;
        this.userRepository = userRepository;
    }

    @Override
    public User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @Override
    @Transactional
    public Long createQuote(QuoteCreateDto dto) {
        User user = currentUser();
        Quote q = new Quote();
        q.setUser(user);
        q.setDiscount(dto.getDiscount() != null ? dto.getDiscount() : 0);

        if (dto.getLogoBase64() != null && !dto.getLogoBase64().isBlank()) {
            String base64 = dto.getLogoBase64();
            int comma = base64.indexOf(',');
            if (comma >= 0) base64 = base64.substring(comma + 1);
            byte[] imageBytes = Base64.getDecoder().decode(base64);

            String path = "logos/" + System.currentTimeMillis() + ".png";

            supabaseClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/object/{bucket}/{path}")
                            .queryParam("cacheControl", "3600")
                            .queryParam("upsert", "false")
                            .build("quotes-bucket", path))
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .bodyValue(imageBytes)
                    .retrieve()
                    .onStatus(
                            HttpStatusCode::isError,
                            clientResponse -> clientResponse
                                    .bodyToMono(String.class)
                                    .flatMap(errorBody ->
                                            Mono.error(new RuntimeException("Supabase upload failed: " + errorBody))
                                    )
                    )
                    .bodyToMono(Void.class)
                    .block();

            String publicUrl = supabaseUrl
                    + "/storage/v1/object/public/quotes-bucket/"
                    + path;
            q.setLogoUrl(publicUrl);
        }


        q.setItems(dto.getItems().stream().map(itemDto -> {
            Article art = articleRepo.findById(itemDto.getArticleId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST, "Article not found"));
            QuoteItem qi = new QuoteItem();
            qi.setQuote(q);
            qi.setArticle(art);
            qi.setQuantity(itemDto.getQuantity());
            return qi;
        }).collect(Collectors.toList()));

        quoteRepo.save(q);
        return q.getId();
    }

    @Override
    public ResponseEntity<Resource> getQuotePdf(Long quoteId) {
        Quote q = quoteRepo.findById(quoteId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Quote not found"));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            if (q.getLogoUrl() != null) {
                Image logo = Image.getInstance(new java.net.URL(q.getLogoUrl()));
                logo.scaleToFit(100, 50);
                doc.add(logo);
            }

            Paragraph header = new Paragraph("Ponuda ID: " + q.getId(),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16));
            header.setAlignment(Element.ALIGN_CENTER);
            doc.add(header);
            doc.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{4, 1, 2, 2});
            Stream.of("Naziv", "Količina", "Jedinična cijena", "Ukupno")
                    .forEach(col -> {
                        PdfPCell cell = new PdfPCell(new Phrase(col,
                                FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
                        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
                        table.addCell(cell);
                    });

            q.getItems().forEach(it -> {
                table.addCell(it.getArticle().getName());
                table.addCell(it.getQuantity().toString());
                table.addCell(String.format("%.2f €", it.getArticle().getPrice()));
                double lineTotal = it.getQuantity() * it.getArticle().getPrice();
                table.addCell(String.format("%.2f €", lineTotal));
            });

            doc.add(table);

            double total = q.getItems().stream()
                    .mapToDouble(it -> it.getQuantity() * it.getArticle().getPrice())
                    .sum();
            if (q.getDiscount() > 0) {
                doc.add(new Paragraph(
                        String.format("Rabat: %d%%", q.getDiscount()),
                        FontFactory.getFont(FontFactory.HELVETICA, 12)
                ));
                total = total * (100 - q.getDiscount()) / 100.0;
            }
            Paragraph pTotal = new Paragraph("\nUkupno: "
                    + String.format("%.2f €", total),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12));
            pTotal.setAlignment(Element.ALIGN_RIGHT);
            doc.add(pTotal);

            doc.close();

            ByteArrayResource resource = new ByteArrayResource(baos.toByteArray());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"quote-" + q.getId() + ".pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);

        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "PDF generation failed", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public QuoteResponseDto getQuoteById(Long id) {
        User user = currentUser();
        Quote q = quoteRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote not found"));

        if (!q.getUser().getUserId().equals(user.getUserId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote not found");
        }

        return new QuoteResponseDto(
                q.getId(),
                q.getItems().stream()
                        .map(it -> new QuoteItemDto(it.getArticle().getArticleId(), it.getQuantity()))
                        .collect(Collectors.toList()),
                q.getCreatedAt(),
                q.getLogoUrl(),
                q.getDiscount()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuoteResponseDto> getAllQuotes() {
        User user = currentUser();

        return quoteRepo.findByUser(user).stream()
                .map(q -> new QuoteResponseDto(
                                q.getId(),
                                q.getItems().stream()
                                        .map(it -> new QuoteItemDto(
                                                it.getArticle().getArticleId(),
                                                it.getQuantity()))
                                        .collect(Collectors.toList()),
                                q.getCreatedAt(),
                                q.getLogoUrl(),
                                q.getDiscount()
                        )
                ).collect(Collectors.toList());
    }
}
