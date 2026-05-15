package org.socialbackend.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.SignatureAlgorithm;
import lombok.RequiredArgsConstructor;
import org.socialbackend.dto.CloudinaryDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/social/cloudinary")
@RequiredArgsConstructor
public class CloudinaryController {
    private final Cloudinary cloudinary;
    @GetMapping
    public ResponseEntity<CloudinaryDTO> getSignature(){
        Map<String,Object> paramsToSign = new HashMap<>();
        Long timestamp = System.currentTimeMillis() / 1000L;
        paramsToSign.put("timestamp", timestamp);
        return ResponseEntity.ok(new CloudinaryDTO(cloudinary.apiSignRequest(paramsToSign, cloudinary.config.apiSecret, SignatureAlgorithm.SHA256.ordinal()),timestamp));
    }


}
