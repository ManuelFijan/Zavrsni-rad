package com.OfferMaster.repository;

import com.OfferMaster.model.CalendarEvent;
import com.OfferMaster.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    List<CalendarEvent> findByUserOrderByEventDateAsc(User user);
}