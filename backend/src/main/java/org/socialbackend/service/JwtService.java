package org.socialbackend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.socialbackend.details.AppUserDetails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

import java.util.Map;
import java.util.function.Function;

/**
 * Service class for handling JSON Web Token (JWT) operations.
 * This includes generating, validating, and extracting information from JWTs.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Service
public class JwtService {
    @Value("${application.security.jwt.secret-key}")
    private String secretKey;
    @Value("${application.security.jwt.expiration}")
    private Long expiration;

    /**
     * Extracts the username (subject) from a given JWT token.
     *
     * @param token The JWT token.
     * @return The username extracted from the token.
     * @throws io.jsonwebtoken.JwtException if the token is invalid, malformed, or expired.
     */
    public String extractUsername(String token){
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Generates a JWT token for a given user with additional claims.
     *
     * @param extraClaims A map of extra claims to include in the token.
     * @param userDetails The user details for whom the token is being generated.
     * @return The generated JWT token string.
     */
    public String generateToken(Map<String, Object> extraClaims, AppUserDetails userDetails){
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey())
                .compact();
    }

    /**
     * Validates a JWT token against the provided user details.
     * Checks if the username in the token matches the user details username and if the token is not expired.
     *
     * @param token The JWT token to validate.
     * @param userDetails The user details to validate against.
     * @return True if the token is valid, false otherwise.
     * @throws io.jsonwebtoken.JwtException if the token cannot be parsed properly.
     */
    public boolean isTokenValid(String token, UserDetails userDetails){
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    /**
     * Checks if a JWT token is expired.
     *
     * @param token The JWT token.
     * @return True if the token is expired, false otherwise.
     */
    private boolean isTokenExpired(String token){
        return extractExpiration(token).before(new Date());
    }

    /**
     * Extracts the expiration date from a JWT token.
     *
     * @param token The JWT token.
     * @return The expiration date of the token.
     */
    private Date extractExpiration(String token){
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extracts a specific claim from the JWT token using a claims resolver function.
     *
     * @param token The JWT token.
     * @param claimsResolver A function to resolve the desired claim from the Claims object.
     * @param <T> The type of the claim to extract.
     * @return The extracted claim.
     */
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extracts all claims from a JWT token.
     *
     * @param token The JWT token.
     * @return All claims contained within the token.
     */
    private Claims extractAllClaims(String token){
        return Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey)))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Retrieves the signing key used for JWT operations.
     *
     * @return The signing key.
     */
    private Key getSignInKey(){
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
