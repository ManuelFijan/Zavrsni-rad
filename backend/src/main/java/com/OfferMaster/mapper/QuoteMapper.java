package com.OfferMaster.mapper;

import com.OfferMaster.dto.QuoteItemDto;
import com.OfferMaster.dto.QuoteResponseDto;
import com.OfferMaster.model.Quote;
import com.OfferMaster.model.QuoteItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface QuoteMapper {
    QuoteMapper INSTANCE = Mappers.getMapper(QuoteMapper.class);

    @Mapping(target = "items", source = "items")
    @Mapping(target = "projectId", expression = "java(quote.getProject() != null ? quote.getProject().getId() : null)")
    @Mapping(target = "projectName", expression = "java(quote.getProject() != null ? quote.getProject().getName() : null)")
    QuoteResponseDto toDto(Quote quote);

    @Mapping(source = "article.articleId", target = "productId")
    @Mapping(source = "quantity", target = "quantity")
    QuoteItemDto quoteItemToDto(QuoteItem quoteItem);

    List<QuoteItemDto> quoteItemsToDto(List<QuoteItem> quoteItems);
}