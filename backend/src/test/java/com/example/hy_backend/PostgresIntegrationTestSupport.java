package com.example.hy_backend;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import java.io.IOException;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

public abstract class PostgresIntegrationTestSupport {

    private static final String TEST_USERNAME = "postgres";
    private static final String TEST_DATABASE = "postgres";
    private static final String TEST_PASSWORD = "postgres";
    private static final EmbeddedPostgres POSTGRES = startPostgres();

    @DynamicPropertySource
    static void registerDatabaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> POSTGRES.getJdbcUrl(TEST_USERNAME, TEST_DATABASE));
        registry.add("spring.datasource.username", () -> TEST_USERNAME);
        registry.add("spring.datasource.password", () -> TEST_PASSWORD);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
    }

    private static EmbeddedPostgres startPostgres() {
        try {
            return EmbeddedPostgres.builder().start();
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to start embedded PostgreSQL for integration tests", exception);
        }
    }
}