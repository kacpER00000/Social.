package org.socialbackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.socialbackend.dto.PostLikeDTO;
import org.socialbackend.model.Post;
import org.socialbackend.model.PostLike;
import org.socialbackend.model.User;
import org.socialbackend.repository.PostLikeRepository;
import org.socialbackend.repository.PostRepository;
import org.socialbackend.repository.UserLoginDataRepository;
import org.socialbackend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class PostLikeService {
    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final UserLoginDataRepository userLoginDataRepository;

    @Transactional
    public void likePost(Long postId, String email){
        User user = findUserByEmail(email);
        if(postLikeRepository.existsByPost_postIdAndUser_userId(postId,user.getUserId())){
            throw new IllegalStateException("Already liked.");
        }
        Post post = postRepository.findById(postId).orElseThrow(() -> new NoSuchElementException("Post with this id don't exist"));
        postRepository.incrementLikes(postId);
        postLikeRepository.save(new PostLike(post,user));
    }

    @Transactional
    public void unlikePost(Long postId, String email){
        User user = findUserByEmail(email);
        long deletedCount = postLikeRepository.deleteByPost_postIdAndUser_userId(postId, user.getUserId());
        if(deletedCount > 0){
            postRepository.decrementLikes(postId);
            return;
        }
        throw new IllegalStateException("Already unliked");
    }

    public Page<PostLikeDTO> findUserWhoLikePost(Long postId, Pageable pageable){
        Page<PostLike> usersWhoLike = postLikeRepository.findAllByPost_PostId(postId,pageable);
        return usersWhoLike.map(this::mapToDTO);
    }
    private PostLikeDTO mapToDTO(PostLike postLike){
        String username = postLike.getUser().getFirstName() + " " + postLike.getUser().getLastName();
        return new PostLikeDTO(username, postLike.getUser().getUserId(),postLike.getPost().getPostId(),postLike.getLikedAt());
    }
    private User findUserByEmail(String email){
        return userLoginDataRepository.findByEmail(email).orElseThrow(() -> new NoSuchElementException("Current user not found.")).getUser();
    }
}
