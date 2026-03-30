package org.socialbackend.exception;


import org.apache.tomcat.util.http.InvalidParameterException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;

import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.NoSuchElementException;

/**
 * Global exception handler for the application.
 * This class handles exceptions thrown by the controllers and returns appropriate HTTP responses.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    /**
     * Handles NoSuchElementException.
     *
     * @param e The exception.
     * @return A ResponseEntity with a NOT_FOUND status.
     */
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<String> handleNotFound(NoSuchElementException e){
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

    /**
     * Handles IllegalStateException.
     *
     * @param e The exception.
     * @return A ResponseEntity with a BAD_REQUEST status.
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalState(IllegalStateException e){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());

    }

    /**
     * Handles InvalidParameterException.
     *
     * @param e The exception.
     * @return A ResponseEntity with a BAD_REQUEST status.
     */
    @ExceptionHandler(InvalidParameterException.class)
    public ResponseEntity<String> handleInvalidParameter(InvalidParameterException e){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }
}
