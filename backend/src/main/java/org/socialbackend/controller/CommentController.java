package org.socialbackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.socialbackend.details.AppUserDetails;
import org.socialbackend.dto.CommentDTO;
import org.socialbackend.request.CommentRequest;
import org.socialbackend.service.CommentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/social")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<Page<CommentDTO>> getPostComments(@PathVariable Long postId, @PageableDefault(page=0) Pageable pageable, Authentication authentication){
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(commentService.findPostComments(postId,pageable, userDetails.getUserId()));
    }

    @GetMapping("/comments/{commentId}")
    public ResponseEntity<CommentDTO> getComment(@PathVariable Long commentId, Authentication authentication){
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(commentService.findCommentByCommentId(commentId, userDetails.getUserId()));
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentDTO> createComment(@PathVariable Long postId, @Valid @RequestBody CommentRequest commentRequest, Authentication authentication){
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.addComment(postId, commentRequest,userDetails.getUserId()));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<Void> editComment(@PathVariable Long commentId, Authentication authentication, @Valid @RequestBody CommentRequest commentRequest){
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        commentService.updateComment(commentId, userDetails.getUserId(), commentRequest);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId, Authentication authentication){
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        commentService.deleteComment(commentId,userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }
}
