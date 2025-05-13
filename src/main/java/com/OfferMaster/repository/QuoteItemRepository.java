package com.OfferMaster.repository;

import com.OfferMaster.model.QuoteItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuoteItemRepository extends JpaRepository<QuoteItem, Long> {
}
