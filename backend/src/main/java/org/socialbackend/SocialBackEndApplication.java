package org.socialbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for SocialBackend server
 *
 * @author Kacper Kurek
 * @version 1.0
 * @since 1.0
 */

@SpringBootApplication
public class SocialBackEndApplication {

    public static void main(String[] args) {
        SpringApplication.run(SocialBackEndApplication.class, args);
    }

}
