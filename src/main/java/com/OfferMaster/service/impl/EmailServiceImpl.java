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

import java.nio.charset.StandardCharsets;

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
        boolean hasRecipientName = recipientName != null && !recipientName.isBlank();
        ctx.setVariable("hasRecipientName", hasRecipientName);
        ctx.setVariable("recipientName", recipientName);
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

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        Context ctx = new Context();
        String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;
        ctx.setVariable("resetLink", resetLink);
        String html = templateEngine.process("password-reset-email", ctx);

        MimeMessage msg = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(
                    msg,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Resetirajte svoju lozinku");
            helper.setText(html, true);

            mailSender.send(msg);
        } catch (MessagingException ex) {
            throw new RuntimeException("Ne mogu poslati reset lozinke email.", ex);
        }
    }

}

