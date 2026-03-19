package org.socialbackend;

import org.junit.jupiter.api.Test;
import org.socialbackend.controller.CommentController;
import org.socialbackend.details.AppUserDetails;
import org.socialbackend.dto.CommentDTO;
import org.socialbackend.request.CommentRequest;
import org.socialbackend.service.CommentService;
import org.socialbackend.service.CustomUserDetailsService;
import org.socialbackend.service.JwtService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CommentController.class)
public class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CommentService commentService;

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
    void shouldGetPostComments() throws Exception {
        Long postId = 1L;
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        Page<CommentDTO> commentPage = new PageImpl<>(List.of(new CommentDTO()));
        when(commentService.findPostComments(eq(postId), any(Pageable.class), eq(loggedUserId))).thenReturn(commentPage);
        mockMvc.perform(get("/social/posts/{postId}/comments", postId)
                        .principal(mockAuthentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void shouldGetComment() throws Exception {
        Long commentId = 1L;
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        CommentDTO commentDTO = new CommentDTO();
        commentDTO.setCommentId(commentId);
        when(commentService.findCommentByCommentId(commentId, loggedUserId)).thenReturn(commentDTO);
        mockMvc.perform(get("/social/comments/{commentId}", commentId)
                        .principal(mockAuthentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.commentId").value(commentId));
    }

    @Test
    void shouldNotGetCommentWhenNotFound() throws Exception {
        Long commentId = 1L;
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        when(commentService.findCommentByCommentId(commentId, loggedUserId)).thenThrow(NoSuchElementException.class);
        mockMvc.perform(get("/social/comments/{commentId}", commentId)
                        .principal(mockAuthentication))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldCreateComment() throws Exception {
        Long postId = 1L;
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        CommentRequest request = new CommentRequest("Test content");
        CommentDTO createdComment = new CommentDTO();
        createdComment.setCommentId(100L);
        when(commentService.addComment(postId, request, loggedUserId)).thenReturn(createdComment);
        mockMvc.perform(post("/social/posts/{postId}/comments", postId)
                        .principal(mockAuthentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.commentId").value(100L));
    }

    @Test
    void shouldNotCreateComment() throws Exception {
        Long postId = 1L;
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        CommentRequest request = new CommentRequest("Test content");
        when(commentService.addComment(postId, request, loggedUserId)).thenThrow(NoSuchElementException.class);
        mockMvc.perform(post("/social/posts/{postId}/comments", postId)
                        .principal(mockAuthentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldEditComment() throws Exception {
        Long commentId = 1L;
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        CommentRequest request = new CommentRequest("Updated content");

        mockMvc.perform(put("/social/comments/{commentId}", commentId)
                        .principal(mockAuthentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(commentService, times(1)).updateComment(commentId, loggedUserId, request);
    }

    @Test
    void shouldNotEditCommentWhenNotOwner() throws Exception {
        Long commentId = 1L;
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        CommentRequest request = new CommentRequest("Updated content");

        doThrow(new IllegalStateException("You can't edit this comment")).when(commentService).updateComment(commentId, loggedUserId, request);

        mockMvc.perform(put("/social/comments/{commentId}", commentId)
                        .principal(mockAuthentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldDeleteComment() throws Exception {
        Long commentId = 1L;
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);

        mockMvc.perform(delete("/social/comments/{commentId}", commentId)
                        .principal(mockAuthentication))
                .andExpect(status().isNoContent());

        verify(commentService, times(1)).deleteComment(commentId, loggedUserId);
    }

    @Test
    void shouldNotDeleteCommentWhenNotFound() throws Exception {
        Long commentId = 1L;
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);

        doThrow(NoSuchElementException.class).when(commentService).deleteComment(commentId, loggedUserId);

        mockMvc.perform(delete("/social/comments/{commentId}", commentId)
                        .principal(mockAuthentication))
                .andExpect(status().isNotFound());
    }
}
