package org.socialbackend.controller;

import org.apache.tomcat.util.http.InvalidParameterException;
import org.junit.jupiter.api.Test;
import org.socialbackend.details.AppUserDetails;
import org.socialbackend.dto.PostDTO;
import org.socialbackend.dto.PostLikeDTO;
import org.socialbackend.request.PostRequest;
import org.socialbackend.service.CustomUserDetailsService;
import org.socialbackend.service.JwtService;
import org.socialbackend.service.PostLikeService;
import org.socialbackend.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PostController.class)
public class PostControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PostService postService;
    @MockitoBean
    private PostLikeService postLikeService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private Authentication createMockAuthentication(Long userId) {
        AppUserDetails mockUserDetails = mock(AppUserDetails.class);
        when(mockUserDetails.getUserId()).thenReturn(userId);
        return new UsernamePasswordAuthenticationToken(mockUserDetails, null, Collections.emptyList());
    }
    
    @Test
    void shouldReturnPost() throws Exception {
        Long loggedUserId=99L;
        Long targetPostId=1L;
        Long postAuthorId=10L;
        String title = "Test";
        String content = "Test content";
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        PostDTO expectedDto = new PostDTO();
        expectedDto.setPostId(targetPostId);
        expectedDto.setAuthorId(postAuthorId);
        expectedDto.setTitle(title);
        expectedDto.setContent(content);
        when(postService.findPostById(targetPostId, loggedUserId)).thenReturn(expectedDto);
        mockMvc.perform(get("/social/posts/"+targetPostId)
                .principal(mockAuthentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.postId").value(targetPostId))
                .andExpect(jsonPath("$.authorId").value(postAuthorId))
                .andExpect(jsonPath("$.title").value(title))
                .andExpect(jsonPath("$.content").value(content));

    }

    @Test
    void shouldNotReturnPost() throws Exception{
        Long loggedUserId=99L;
        Long targetPostId=1L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        when(postService.findPostById(targetPostId, loggedUserId)).thenThrow(NoSuchElementException.class);
        mockMvc.perform(get("/social/posts/"+targetPostId)
                .principal(mockAuthentication))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldCreatePost() throws Exception{
        Long loggedUserId=99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        String title="Test";
        String content="Test content";
        PostRequest postRequest = new PostRequest(title,content,null);
        PostDTO expectedDTO = new PostDTO();
        expectedDTO.setAuthorId(loggedUserId);
        expectedDTO.setTitle(title);
        expectedDTO.setContent(content);
        when(postService.addPost(postRequest,loggedUserId)).thenReturn(expectedDTO);
        mockMvc.perform(post("/social/posts")
                .principal(mockAuthentication)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(postRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.authorId").value(loggedUserId))
                .andExpect(jsonPath("$.title").value(title))
                .andExpect(jsonPath("$.content").value(content));
        verify(postService,times(1)).addPost(any(PostRequest.class), eq(loggedUserId));
    }

    @Test
    void shouldNotCreatePost() throws Exception{
        Long loggedUserId=99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        String title="Test";
        String content="Test content";
        PostRequest postRequest = new PostRequest(title,content,null);
        when(postService.addPost(postRequest,loggedUserId)).thenThrow(NoSuchElementException.class);
        mockMvc.perform(post("/social/posts")
                        .principal(mockAuthentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(postRequest)))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldUpdatePost() throws Exception{
        Long loggedUserId=99L;
        Long targetPostId=1L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        String title="Test";
        String content="Test content";
        PostRequest postRequest = new PostRequest(title,content,null);
        mockMvc.perform(put("/social/posts/"+targetPostId)
                .principal(mockAuthentication)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(postRequest)))
                .andExpect(status().isOk());
        verify(postService,times(1)).updatePost(eq(targetPostId), eq(loggedUserId), any(PostRequest.class));
    }

    @Test
    void shouldNotUpdatePostBecauseOfNoPost() throws Exception{
        Long loggedUserId=99L;
        Long targetPostId=1L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        String title="Test";
        String content="Test content";
        PostRequest postRequest = new PostRequest(title,content,null);
        doThrow(NoSuchElementException.class).when(postService).updatePost(eq(targetPostId),eq(loggedUserId),any(PostRequest.class));
        mockMvc.perform(put("/social/posts/"+targetPostId)
                        .principal(mockAuthentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(postRequest)))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldNotUpdatePostBecauseOfNoPermission() throws Exception{
        Long loggedUserId=99L;
        Long targetPostId=1L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        String title="Test";
        String content="Test content";
        PostRequest postRequest = new PostRequest(title,content,null);
        doThrow(InvalidParameterException.class).when(postService).updatePost(eq(targetPostId),eq(loggedUserId),any(PostRequest.class));
        mockMvc.perform(put("/social/posts/"+targetPostId)
                        .principal(mockAuthentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(postRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldDeletePost() throws Exception{
        Long loggedUserId=99L;
        Long targetPostId=1L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        mockMvc.perform(delete("/social/posts/"+targetPostId)
                        .principal(mockAuthentication))
                .andExpect(status().isNoContent());
        verify(postService,times(1)).deletePost(targetPostId,loggedUserId);
    }

    @Test
    void shouldNotDeletePostBecauseOfNoPost() throws Exception{
        Long loggedUserId=99L;
        Long targetPostId=1L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        doThrow(NoSuchElementException.class).when(postService).deletePost(targetPostId,loggedUserId);
        mockMvc.perform(delete("/social/posts/"+targetPostId)
                        .principal(mockAuthentication))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldNotDeletePostBecauseOfNoPermission() throws Exception{
        Long loggedUserId=99L;
        Long targetPostId=1L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        doThrow(InvalidParameterException.class).when(postService).deletePost(targetPostId,loggedUserId);
        mockMvc.perform(delete("/social/posts/"+targetPostId)
                        .principal(mockAuthentication))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldGetLatestPosts() throws Exception {
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        Page<PostDTO> postPage = new PageImpl<>(List.of(new PostDTO(), new PostDTO()));
        when(postService.findLatestPosts(any(Pageable.class), eq(loggedUserId))).thenReturn(postPage);
        mockMvc.perform(get("/social/posts/latest")
                        .principal(mockAuthentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.size()").value(2));
    }

    @Test
    void shouldGetUserLatestPosts() throws Exception {
        Long targetUserId = 1L;
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);;
        Page<PostDTO> postPage = new PageImpl<>(List.of(new PostDTO()));
        when(postService.findLatestUserPosts(eq(targetUserId), any(Pageable.class), eq(loggedUserId))).thenReturn(postPage);
        mockMvc.perform(get("/social/posts/{userId}/latest", targetUserId)
                        .principal(mockAuthentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.size()").value(1));
    }

    @Test
    void shouldLikePost() throws Exception {
        Long postId = 1L;
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);;
        mockMvc.perform(post("/social/posts/{postId}/like", postId)
                        .principal(mockAuthentication))
                .andExpect(status().isOk());
        verify(postLikeService, times(1)).likePost(postId, loggedUserId);
    }

    @Test
    void shouldNotLikePostWhenAlreadyLiked() throws Exception {
        Long postId = 1L;
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);;
        doThrow(new IllegalStateException("Already liked.")).when(postLikeService).likePost(postId, loggedUserId);
        mockMvc.perform(post("/social/posts/{postId}/like", postId)
                        .principal(mockAuthentication))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldUnlikePost() throws Exception {
        Long postId = 1L;
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);;
        mockMvc.perform(delete("/social/posts/{postId}/like", postId)
                        .principal(mockAuthentication))
                .andExpect(status().isNoContent());
        verify(postLikeService, times(1)).unlikePost(postId, loggedUserId);
    }

    @Test
    void shouldNotUnlikePostWhenNotLiked() throws Exception {
        Long postId = 1L;
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);;
        doThrow(new IllegalStateException("Already unliked")).when(postLikeService).unlikePost(postId, loggedUserId);
        mockMvc.perform(delete("/social/posts/{postId}/like", postId)
                        .principal(mockAuthentication))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldGetUsersWhoLikePost() throws Exception {
        Long postId = 1L;
        Page<PostLikeDTO> likePage = new PageImpl<>(List.of(new PostLikeDTO(), new PostLikeDTO()));
        when(postLikeService.findUserWhoLikePost(eq(postId), any(Pageable.class))).thenReturn(likePage);
        mockMvc.perform(get("/social/posts/{postId}/likes", postId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.size()").value(2));
    }
}
