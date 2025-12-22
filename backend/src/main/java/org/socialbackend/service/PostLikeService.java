package org.socialbackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.socialbackend.dto.PostLikeDTO;
import org.socialbackend.model.Post;
import org.socialbackend.model.PostLike;
import org.socialbackend.model.User;
import org.socialbackend.repository.PostLikeRepository;
import org.socialbackend.repository.PostRepository;
import org.socialbackend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostLikeService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository postLikeRepository;

    @Transactional
    public void likePost(Long postId, Long userId){
        if(postLikeRepository.existsByPost_postIdAndUser_userId(postId,userId)){
            throw new IllegalStateException("Already liked.");
        }
        Post post = postRepository.getReferenceById(postId);
        User user = userRepository.getReferenceById(userId);
        postRepository.incrementLikes(postId);
        postLikeRepository.save(new PostLike(post,user));
    }

    @Transactional
    public void unlikePost(Long postId, Long userId){
        long deletedCount = postLikeRepository.deleteByPost_postIdAndUser_userId(postId, userId);
        if(deletedCount > 0){
            postRepository.decrementLikes(postId);
        }
    }

    public Page<PostLikeDTO> findUserWhoLikePost(Long postId, Pageable pageable){
        Page<PostLike> usersWhoLike = postLikeRepository.findAllByPost_PostId(postId,pageable);
        return usersWhoLike.map(this::mapToDTO);
    }
    public PostLikeDTO mapToDTO(PostLike postLike){
        String username = postLike.getUser().getFirstName() + " " + postLike.getUser().getLastName();
        return new PostLikeDTO(username, postLike.getUser().getUserId(),postLike.getPost().getPostId(),postLike.getLikedAt());
    }
}
