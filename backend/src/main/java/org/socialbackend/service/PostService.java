package org.socialbackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.socialbackend.dto.PostDTO;
import org.socialbackend.model.Post;
import org.socialbackend.model.User;
import org.socialbackend.repository.PostLikeRepository;
import org.socialbackend.repository.PostRepository;
import org.socialbackend.repository.UserRepository;
import org.socialbackend.request.CreatePostRequest;
import org.socialbackend.request.UpdatePostRequest;
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
        User owner = findUserById(createPostRequest.getUserId());
        Post post = new Post(owner,createPostRequest.getTitle(), createPostRequest.getContent());
        owner.addPost(post);
        postRepository.save(post);
    }

    public PostDTO findPostById(Long postId){
        return postRepository.findById(postId).map(this::mapToDTO).orElseThrow(() -> new NoSuchElementException("Post with this id don't exist"));
    }

    @Transactional
    public void updatePost(Long postId, Long userId, UpdatePostRequest updatePostRequest){
        Post foundPost = getPostEntity(postId);
        validatePostOwner(foundPost,userId);
        foundPost.setTitle(updatePostRequest.getTitle());
        foundPost.setContent(updatePostRequest.getContent());
    }

    @Transactional
    public void deletePost(Long postId, Long userId){
        Post postToDelete = getPostEntity(postId);
        validatePostOwner(postToDelete,userId);
        User owner = postToDelete.getUser();
        if(owner != null){
            owner.removePost(postToDelete);
        }
        postRepository.delete(postToDelete);
    }

    public Page<PostDTO> findLatestPosts(Pageable pageable){
        return postRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::mapToDTO);
    }

    public Page<PostDTO> findLatestUserPosts(Long userId, Pageable pageable){
        User user = findUserById(userId);
        return postRepository.findAllByUserOrderByCreatedAtDesc(user,pageable).map(this::mapToDTO);
    }

    private void validatePostOwner(Post post, Long userId){
        if(!post.getUser().getUserId().equals(userId)){
            throw new IllegalStateException("You can't modify this post");
        }
    }

    private Post getPostEntity(Long postId){
        return postRepository.findById(postId).orElseThrow(() -> new NoSuchElementException("Post with this id don't exist"));
    }

    private PostDTO mapToDTO(Post post){
        Long likesNumber = post.getLikesCount();
        String nickname = post.getUser().getFirstName() + " " + post.getUser().getLastName();
        return new PostDTO(post.getPostId(),nickname,post.getTitle(),post.getContent(),post.getCreatedAt(),likesNumber);
    }

    private User findUserById(Long userId){
        return userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User with that id don't exist"));
    }
}
