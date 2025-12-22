package org.socialbackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.socialbackend.dto.PostDTO;
import org.socialbackend.dto.PostLikeDTO;
import org.socialbackend.request.CreatePostRequest;
import org.socialbackend.request.UpdatePostRequest;
import org.socialbackend.service.PostLikeService;
import org.socialbackend.service.PostService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/social/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;
    private final PostLikeService postLikeService;

    @GetMapping("/{postId}")
    public ResponseEntity<PostDTO> getPost(@PathVariable Long postId){
        return ResponseEntity.ok(postService.findPostById(postId));
    }
    @PostMapping
    public ResponseEntity<Void> createPost(@Valid @RequestBody CreatePostRequest createPostRequest){
        postService.addPost(createPostRequest);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    @PutMapping("/{postId}")
    public ResponseEntity<Void> updatePost(@PathVariable Long postId,@Valid @RequestBody UpdatePostRequest updatePostRequest){
        postService.updatePost(postId,updatePostRequest);
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId){
        postService.deletePost(postId);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/latest")
    public ResponseEntity<Page<PostDTO>> getLatestPosts(@PageableDefault(page = 0) Pageable pageable){
        return ResponseEntity.ok(postService.findLatestPosts(pageable));
    }
    @GetMapping("/{userId}/latest")
    public ResponseEntity<Page<PostDTO>> getUserLatestPosts(@PathVariable Long userId, @PageableDefault(page = 0) Pageable pageable){
        return ResponseEntity.ok(postService.findLatestUserPosts(userId,pageable));
    }
    @PostMapping("/{postId}/like")
    public ResponseEntity<Void> likePost(@PathVariable Long postId, @RequestParam Long userId){
        postLikeService.likePost(postId,userId);
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/{postId}/like")
    public ResponseEntity<Void> unlikePost(@PathVariable Long postId, @RequestParam Long userId){
        postLikeService.unlikePost(postId,userId);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/{postId}/likes")
    public ResponseEntity<Page<PostLikeDTO>> getUsersWhoLikePost(@PathVariable Long postId, @PageableDefault(page=0) Pageable pageable){
        return ResponseEntity.ok(postLikeService.findUserWhoLikePost(postId,pageable));
    }
}
