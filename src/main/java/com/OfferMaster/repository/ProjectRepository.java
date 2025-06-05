package com.OfferMaster.repository;

import com.OfferMaster.model.Project;
import com.OfferMaster.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUserOrderByNameAsc(User user);
}