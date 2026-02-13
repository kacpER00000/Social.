package org.socialbackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.http.InvalidParameterException;
import org.socialbackend.dto.PostDTO;
import org.socialbackend.model.Post;
import org.socialbackend.model.User;
import org.socialbackend.repository.PostRepository;
import org.socialbackend.repository.UserRepository;
import org.socialbackend.request.PostRequest;
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
    public PostDTO addPost(PostRequest postRequest, Long userId){
        User owner = findUserById(userId);
        Post post = new Post(owner, postRequest.getTitle(), postRequest.getContent());
        owner.addPost(post);
        postRepository.save(post);
        return mapToDTO(post);
    }

    public PostDTO findPostById(Long postId){
        return postRepository.findById(postId).map(this::mapToDTO).orElseThrow(() -> new NoSuchElementException("Post with this id don't exist"));
    }

    @Transactional
    public void updatePost(Long postId, Long userId, PostRequest updatePostRequest){
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
        User owner = findUserById(userId);
        if(!post.getUser().equals(owner)){throw new InvalidParameterException("You can only edit your posts.");}
    }

    private Post getPostEntity(Long postId){
        return postRepository.findById(postId).orElseThrow(() -> new NoSuchElementException("Post with this id don't exist"));
    }

    private PostDTO mapToDTO(Post post){
        Long likesNumber = post.getLikesCount();
        Long commentCount = post.getCommentCount();
        String nickname = post.getUser().getFirstName() + " " + post.getUser().getLastName();
        return new PostDTO(post.getPostId(),nickname,post.getTitle(),post.getContent(),post.getCreatedAt(),likesNumber,commentCount);
    }

    private User findUserById(Long userId){
        return userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User with that id don't exist"));
    }
}
