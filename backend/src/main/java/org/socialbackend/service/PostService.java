package org.socialbackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.socialbackend.model.Post;
import org.socialbackend.model.User;
import org.socialbackend.repository.PostRepository;
import org.socialbackend.repository.UserRepository;
import org.socialbackend.request.CreatePostRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional
    public void addPost(CreatePostRequest createPostRequest){
        User owner = userRepository.findById(createPostRequest.getUserId()).orElseThrow(() -> new NoSuchElementException("User with this id don't exist"));
        Post post = new Post(owner,createPostRequest.getTitle(), createPostRequest.getContent());
        owner.addPost(post);
        postRepository.save(post);
    }

    public Post findPostById(Long postId){
        return postRepository.findById(postId).orElseThrow(() -> new NoSuchElementException("Post with this id don't exist"));
    }

    @Transactional
    public void updatePost(Long postId, UpdatePostRequest updatePostRequest){
        Post foundPost = findPostById(postId);
        foundPost.setTitle(updatePostRequest.getTitle());
        foundPost.setContent(updatePostRequest.getContent());
    }

    @Transactional
    public void deletePost(Long postId){
        Post postToDelete = findPostById(postId);
        User owner = postToDelete.getUser();
        if(owner != null){
            owner.removePost(postToDelete);
        }
        postRepository.delete(postToDelete);
    }

    public Page<Post> findLatestPosts(Pageable pageable){
        return postRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Page<Post> findLatestUserPosts(Long userId, Pageable pageable){
        User user = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User with that id don't exist"));
        return postRepository.findAllByUserOrderByCreatedAtDesc(user,pageable);
    }
}
