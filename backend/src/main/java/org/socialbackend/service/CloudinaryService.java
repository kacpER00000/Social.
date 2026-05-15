package org.socialbackend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Service class for interacting with the Cloudinary API.
 * This service encapsulates image management operations such as deleting images
 * from the Cloudinary storage using their public IDs.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Service
@AllArgsConstructor
public class CloudinaryService {
    private final Cloudinary cloudinary;

    /**
     * Deletes an image from Cloudinary storage.
     * <p>
     * <b>Note:</b> The {@code imgId} must strictly match the {@code public_id} String generated
     * by Cloudinary upon upload (e.g., alphanumeric strings, not numeric integers). Using an incorrect
     * or malformed ID will silently fail or throw an exception.
     * </p>
     *
     * @param imgId The unique public identifier of the image in Cloudinary.
     * @throws RuntimeException if the deletion operation fails due to network issues or API errors.
     */
    public void deleteImageFromCloudinary(String imgId) {
        try{
            cloudinary.uploader().destroy(imgId, ObjectUtils.emptyMap());
        } catch (Exception e){
            throw new RuntimeException("Unable to delete image", e);
        }
    }
}
