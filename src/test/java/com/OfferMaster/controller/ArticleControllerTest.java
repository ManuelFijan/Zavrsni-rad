package com.OfferMaster.controller;

import com.OfferMaster.dto.ArticleDto;
import com.OfferMaster.dto.ArticleRequestDto;
import com.OfferMaster.enums.ArticleCategory;
import com.OfferMaster.enums.MeasureUnit;
import com.OfferMaster.service.ArticleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ArticleController.class)
@AutoConfigureMockMvc(addFilters = false)
class ArticleControllerTest {
    @Autowired
    MockMvc mvc;

    @MockitoBean
    ArticleService svc;

    @Autowired
    ObjectMapper mapper;

    @MockitoBean
    com.OfferMaster.security.JwtUtil jwtUtil;

    @Test
    void getArticles_returnsPage() throws Exception {
        ArticleDto dto = new ArticleDto();
        dto.setArticleId(1L);
        dto.setName("A");
        Page<ArticleDto> page = new PageImpl<>(List.of(dto), PageRequest.of(0, 20), 1);
        given(svc.getArticles(0, 20, null)).willReturn(page);

        mvc.perform(get("/articles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].articleId").value(1));
    }

    @Test
    void createArticle_returnsDto() throws Exception {
        var req = new ArticleRequestDto("N", ArticleCategory.USLUGA, 10.0, "D");
        var resp = new ArticleDto(2L, "N", ArticleCategory.USLUGA, 10.0, "D", MeasureUnit.KOM);
        given(svc.createArticle(any())).willReturn(resp);

        mvc.perform(post("/articles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.articleId").value(2));
    }

    @Test
    void updateArticle_returnsDto() throws Exception {
        var req = new ArticleRequestDto("N2", ArticleCategory.USLUGA, 20.0, "DD");
        var resp = new ArticleDto(3L, "N2", ArticleCategory.USLUGA, 20.0, "DD", MeasureUnit.KOM);
        given(svc.updateArticle(eq(3L), any())).willReturn(resp);

        mvc.perform(put("/articles/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.articleId").value(3));
    }
}
