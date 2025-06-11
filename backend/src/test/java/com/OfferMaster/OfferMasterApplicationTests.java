package com.OfferMaster;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
		"spring.datasource.url=jdbc:h2:mem:testdb",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.jpa.hibernate.ddl-auto=create-drop",
		"spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
		"SUPABASE_URL=http://dummy-url",
		"SUPABASE_KEY=dummy-key",
		"MAIL_FROM=mail"
})
class OfferMasterApplicationTests {

	@Test
	void contextLoads() {
	}

}
