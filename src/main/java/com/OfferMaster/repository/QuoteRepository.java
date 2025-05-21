package com.OfferMaster.repository;

import com.OfferMaster.model.Quote;
import com.OfferMaster.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuoteRepository extends JpaRepository<Quote, Long> {
    List<Quote> findByUser(User user);
}
