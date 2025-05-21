package com.OfferMaster.service;

public interface EmailService {
    void sendQuoteEmail(String to, String recipientName, Long quoteId);
    void sendPasswordResetEmail(String toEmail, String resetToken);
}
