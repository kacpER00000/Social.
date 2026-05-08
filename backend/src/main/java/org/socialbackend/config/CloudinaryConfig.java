package org.socialbackend.config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

@Configuration
public class CloudinaryConfig {
    @Value("${cloudinary.secret_key}")
    private String secretKey;
    @Bean
    public Cloudinary cloudinary(){
        com.cloudinary.Configuration configuration = new com.cloudinary.Configuration();
        configuration.apiSecret = secretKey;
        return new Cloudinary(configuration);
    }
}
