package com.OfferMaster.service.impl;

import com.OfferMaster.service.EmailService;
import com.OfferMaster.service.QuoteService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
public class EmailServiceImpl implements EmailService {

    @Value("${mail.from}")
    private String fromAddress;
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final QuoteService quoteService;

    public EmailServiceImpl(JavaMailSender mailSender, SpringTemplateEngine templateEngine, QuoteService quoteService) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
        this.quoteService = quoteService;
    }

    @Override
    public void sendQuoteEmail(String to, String recipientName, Long quoteId) {
        Context ctx = new Context();
        ctx.setVariable("recipientName",
                (recipientName != null && !recipientName.isBlank()) ? recipientName : "Korisniče");
        ctx.setVariable("downloadUrl", "https://your.domain.com/api/quotes/" + quoteId + "/pdf");
        String html = templateEngine.process("quote-email", ctx);

        Resource pdf = quoteService
                .getQuotePdf(quoteId)
                .getBody();

        MimeMessage msg = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(msg, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject("Vaša ponuda #" + quoteId);
            helper.setText(html, true);
            assert pdf != null;
            helper.addAttachment(
                    "Ponuda-" + quoteId + ".pdf",
                    pdf
            );
            mailSender.send(msg);
        } catch (MessagingException ex) {
            throw new RuntimeException("Ne mogu poslati email.", ex);
        }
    }
}

