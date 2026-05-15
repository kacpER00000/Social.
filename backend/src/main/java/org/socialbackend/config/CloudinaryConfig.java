package org.socialbackend.config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

/**
 * Configuration class for Cloudinary integration.
 * Initializes the Cloudinary client bean using credentials injected from the application properties.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Configuration
public class CloudinaryConfig {
    @Value("${cloudinary.secret_key}")
    private String secretKey;
    @Value("${cloudinary.api_key}")
    private String apiKey;
    @Value("${cloudinary.cloud_name}")
    private String cloudName;

    /**
     * Creates and configures the Cloudinary bean required for image uploads and deletions.
     *
     * @return A fully configured Cloudinary instance ready to interact with the API.
     */
    @Bean
    public Cloudinary cloudinary(){
        com.cloudinary.Configuration configuration = new com.cloudinary.Configuration();
        configuration.apiSecret = secretKey;
        configuration.apiKey = apiKey;
        configuration.cloudName = cloudName;
        return new Cloudinary(configuration);
    }
}
