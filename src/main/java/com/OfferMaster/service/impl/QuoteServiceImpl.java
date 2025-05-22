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
import java.io.IOException;
import java.io.InputStream;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
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
                        HttpStatus.NOT_FOUND, "Ponuda ne postoji"
                ));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            InputStream fontStream = getClass().getResourceAsStream("/fonts/Roboto-Regular.ttf");
            if (fontStream == null) {
                throw new IllegalStateException("Font file missing");
            }
            byte[] fontBytes = fontStream.readAllBytes();
            BaseFont bf = BaseFont.createFont(
                    "Roboto-Regular.ttf",
                    BaseFont.IDENTITY_H,
                    BaseFont.EMBEDDED,
                    true,
                    fontBytes,
                    null
            );
            Font headerFont = new Font(bf, 16, Font.BOLD);
            Font labelFont = new Font(bf, 12, Font.NORMAL);
            Font boldFont = new Font(bf, 12, Font.BOLD);

            Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            if (q.getLogoUrl() != null && !q.getLogoUrl().isBlank()) {
                Image logo = Image.getInstance(q.getLogoUrl());
                logo.scaleToFit(120, 60);
                logo.setAlignment(Element.ALIGN_LEFT);
                doc.add(logo);
            }

            Paragraph title = new Paragraph("PONUDA ID: " + q.getId(), headerFont);
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(title);
            doc.add(Chunk.NEWLINE);

            ZonedDateTime zdt = q.getCreatedAt().atZone(ZoneId.systemDefault());
            String formattedDate = zdt.format(DateTimeFormatter.ofPattern("dd/MM/yyyy, HH:mm:ss"));
            Paragraph datePara = new Paragraph("Datum: " + formattedDate, labelFont);
            datePara.setSpacingAfter(8f);
            doc.add(datePara);

            PdfPTable table = new PdfPTable(new float[]{3, 2, 1, 2, 2});
            table.setWidthPercentage(100);
            Stream.of("Naziv", "Količina", "Mjerna jedinica", "Jedinična cijena", "Ukupno")
                    .forEach(col -> {
                        PdfPCell h = new PdfPCell(new Phrase(col, boldFont));
                        h.setBackgroundColor(BaseColor.LIGHT_GRAY);
                        h.setHorizontalAlignment(Element.ALIGN_CENTER);
                        table.addCell(h);
                    });
            for (QuoteItem it : q.getItems()) {
                table.addCell(new Phrase(it.getArticle().getName(), labelFont));
                table.addCell(new Phrase(it.getQuantity().toString(), labelFont));
                table.addCell(new Phrase(it.getArticle().getMeasureUnit().toString(), labelFont));
                table.addCell(new Phrase(
                        String.format("%.2f €", it.getArticle().getPrice()),
                        labelFont
                ));
                double lineTotal = it.getQuantity() * it.getArticle().getPrice();
                table.addCell(new Phrase(
                        String.format("%.2f €", lineTotal),
                        labelFont
                ));
            }
            doc.add(table);

            double preDiscount = q.getItems().stream()
                    .mapToDouble(it -> it.getQuantity() * it.getArticle().getPrice())
                    .sum();

            Paragraph preDiscPara = new Paragraph(
                    String.format("Bez rabata: %.2f €", preDiscount),
                    labelFont
            );
            preDiscPara.setSpacingBefore(8f);
            doc.add(preDiscPara);

            double total = preDiscount;
            if (q.getDiscount() != null && q.getDiscount() > 0) {

                doc.add(new Paragraph(
                        String.format("Rabat: %d%%", q.getDiscount()),
                        labelFont
                ));
                total = total * (100 - q.getDiscount()) / 100.0;
            }
            Paragraph pTotal = new Paragraph(
                    String.format("Ukupno: %.2f €", total),
                    boldFont
            );
            pTotal.setAlignment(Element.ALIGN_RIGHT);
            doc.add(Chunk.NEWLINE);
            doc.add(pTotal);

            doc.close();

            ByteArrayResource resource = new ByteArrayResource(baos.toByteArray());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"ponuda-" + q.getId() + ".pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);

        } catch (IOException | DocumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Greška pri generiranju PDF-a", e
            );
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
