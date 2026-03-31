package org.socialbackend.controller;

import org.apache.tomcat.util.http.InvalidParameterException;
import org.junit.jupiter.api.Test;
import org.socialbackend.details.AppUserDetails;
import org.socialbackend.dto.FollowerDTO;
import org.socialbackend.dto.UserDTO;
import org.socialbackend.request.UpdateUserRequest;
import org.socialbackend.service.CustomUserDetailsService;
import org.socialbackend.service.FollowerService;
import org.socialbackend.service.JwtService;
import org.socialbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private FollowerService followerService;

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
    void shouldReturnUser() throws Exception {
        Long targetUserId = 1L;
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        UserDTO expectedDto = new UserDTO();
        expectedDto.setUserId(targetUserId);
        expectedDto.setFirstName("John");
        expectedDto.setLastName("Smith");
        when(userService.findUserById(targetUserId, loggedUserId)).thenReturn(expectedDto);
        mockMvc.perform(get("/social/users/" + targetUserId)
                        .principal(mockAuthentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(targetUserId))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Smith"));
    }

    @Test
    void shouldNotFindAnyUser() throws Exception{
        Long targetUserId = 1L;
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        when(userService.findUserById(targetUserId,loggedUserId)).thenThrow(NoSuchElementException.class);
        mockMvc.perform(get("/social/users/" + targetUserId)
                .principal(mockAuthentication))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldUpdateUser() throws Exception {
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        UpdateUserRequest updateUserRequest = new UpdateUserRequest("John","Smith", LocalDate.of(2000,1,1),'M');
        mockMvc.perform(put("/social/users")
                .principal(mockAuthentication)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateUserRequest)))
                .andExpect(status().isOk());
        verify(userService, times(1)).updateUser(eq(loggedUserId), any(UpdateUserRequest.class));
    }

    @Test
    void shouldNotUpdateUserBecauseOfBadRequestStatus() throws Exception {
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        UpdateUserRequest updateUserRequest = new UpdateUserRequest("John","", LocalDate.of(2000,1,1),'M');
        mockMvc.perform(put("/social/users")
                        .principal(mockAuthentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateUserRequest)))
                .andExpect(status().isBadRequest());
        verify(userService, never()).updateUser(eq(loggedUserId), any(UpdateUserRequest.class));
    }

    @Test
    void shouldNotUpdateUserBecauseOfNoUser() throws Exception {
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        UpdateUserRequest updateUserRequest = new UpdateUserRequest("John","Smith", LocalDate.of(2000,1,1),'M');
        doThrow(NoSuchElementException.class).when(userService).updateUser(loggedUserId,updateUserRequest);
        mockMvc.perform(put("/social/users")
                        .principal(mockAuthentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateUserRequest)))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldDeleteUser() throws Exception {
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        mockMvc.perform(delete("/social/users").
                principal(mockAuthentication))
                .andExpect(status().isNoContent());
        verify(userService, times(1)).deleteUser(eq(loggedUserId));
    }

    @Test
    void shouldNotDeleteUserBecauseOfNoUser() throws Exception {
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        doThrow(NoSuchElementException.class).when(userService).deleteUser(loggedUserId);
        mockMvc.perform(delete("/social/users").
                        principal(mockAuthentication))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldFindUsersByFirstNameOrLastName() throws Exception {
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        UserDTO user1 = new UserDTO();
        user1.setUserId(1L);
        user1.setFirstName("John");
        user1.setLastName("Doe");
        UserDTO user2 = new UserDTO();
        user2.setUserId(2L);
        user2.setFirstName("John");
        user2.setLastName("Smith");
        UserDTO user3 = new UserDTO();
        user3.setUserId(3L);
        user3.setFirstName("John");
        user3.setLastName("Dove");
        String query = "John";
        Page<UserDTO> users = new PageImpl<>(List.of(user1,user2,user3));
        when(userService.findUsersByFirstNameOrLastName(eq(query),eq(loggedUserId),any(Pageable.class))).thenReturn(users);
        mockMvc.perform(get("/social/users/search?query="+query)
                .principal(mockAuthentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.size()").value(3))
                .andExpect(jsonPath("$.content[0].userId").value(user1.getUserId()))
                .andExpect(jsonPath("$.content[0].firstName").value(user1.getFirstName()))
                .andExpect(jsonPath("$.content[0].lastName").value(user1.getLastName()))
                .andExpect(jsonPath("$.content[1].userId").value(user2.getUserId()))
                .andExpect(jsonPath("$.content[1].firstName").value(user2.getFirstName()))
                .andExpect(jsonPath("$.content[1].lastName").value(user2.getLastName()))
                .andExpect(jsonPath("$.content[2].userId").value(user3.getUserId()))
                .andExpect(jsonPath("$.content[2].firstName").value(user3.getFirstName()))
                .andExpect(jsonPath("$.content[2].lastName").value(user3.getLastName()));
    }
    @Test
    void shouldNotFindUsersByFirstNameOrLastNameBecauseOfInvalidQuery() throws Exception {
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        String emptyQuery="";
        when(userService.findUsersByFirstNameOrLastName(eq(emptyQuery),eq(loggedUserId),any(Pageable.class))).thenThrow(InvalidParameterException.class);
        mockMvc.perform(get("/social/users/search?query="+emptyQuery)
                .principal(mockAuthentication))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldFollowUser() throws Exception {
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        Long targetUserId=1L;
        mockMvc.perform(post("/social/users/"+targetUserId+"/follow")
                .principal(mockAuthentication))
                .andExpect(status().isOk());
        verify(followerService,times(1)).follow(loggedUserId,targetUserId);
    }

    @Test
    void shouldNotFollowBecauseOfFollowingYourself() throws Exception {
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        doThrow(IllegalStateException.class).when(followerService).follow(loggedUserId,loggedUserId);
        mockMvc.perform(post("/social/users/"+loggedUserId+"/follow")
                        .principal(mockAuthentication))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldNotFollowBecauseAlreadyFollowingUser() throws Exception {
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        Long targetUserId = 1L;
        doThrow(IllegalStateException.class).when(followerService).follow(loggedUserId,targetUserId);
        mockMvc.perform(post("/social/users/"+targetUserId+"/follow")
                        .principal(mockAuthentication))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldNotFollowBecauseOfNoUser() throws Exception {
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        Long targetUserId = 1L;
        doThrow(NoSuchElementException.class).when(followerService).follow(loggedUserId,targetUserId);
        mockMvc.perform(post("/social/users/"+targetUserId+"/follow")
                        .principal(mockAuthentication))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldUnfollowUser() throws Exception {
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        Long targetUserId=1L;
        mockMvc.perform(delete("/social/users/"+targetUserId+"/follow")
                        .principal(mockAuthentication))
                .andExpect(status().isNoContent());
        verify(followerService,times(1)).unfollow(loggedUserId,targetUserId);
    }

    @Test
    void shouldNotUnfollowBecauseOfUnfollowingYourself() throws Exception {
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        doThrow(IllegalStateException.class).when(followerService).unfollow(loggedUserId,loggedUserId);
        mockMvc.perform(delete("/social/users/"+loggedUserId+"/follow")
                        .principal(mockAuthentication))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldNotUnfollowBecauseAlreadyUnfollowingUser() throws Exception {
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        Long targetUserId = 1L;
        doThrow(IllegalStateException.class).when(followerService).unfollow(loggedUserId,targetUserId);
        mockMvc.perform(delete("/social/users/"+targetUserId+"/follow")
                        .principal(mockAuthentication))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldNotUnfollowBecauseOfNoUser() throws Exception {
        Long loggedUserId = 99L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        Long targetUserId = 1L;
        doThrow(NoSuchElementException.class).when(followerService).unfollow(loggedUserId,targetUserId);
        mockMvc.perform(delete("/social/users/"+targetUserId+"/follow")
                        .principal(mockAuthentication))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnFollowInfo() throws Exception{
        Long loggedUserId = 99L;
        Long targetUserId = 1L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        FollowerDTO followInfo = new FollowerDTO(targetUserId, "John Smith", LocalDateTime.of(2026,3,18,0,0),true,false,1L);
        when(followerService.getFollowInfo(targetUserId,loggedUserId)).thenReturn(followInfo);
        mockMvc.perform(get("/social/users/"+targetUserId+"/follow-status")
                .principal(mockAuthentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(targetUserId));

    }

    @Test
    void shouldReturnUserFollowers() throws Exception {
        Long loggedUserId = 99L;
        Long targetUserId = 1L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        FollowerDTO follower1 = new FollowerDTO();
        follower1.setUserId(10L);
        FollowerDTO follower2 = new FollowerDTO();
        follower2.setUserId(20L);
        FollowerDTO follower3 = new FollowerDTO();
        follower3.setUserId(30L);
        Page<FollowerDTO> targetUserFollowers = new PageImpl<>(List.of(follower1, follower2, follower3));
        when(followerService.findUserFollowers(eq(targetUserId),eq(loggedUserId),any(Pageable.class))).thenReturn(targetUserFollowers);
        mockMvc.perform(get("/social/users/"+targetUserId+"/followers")
                        .principal(mockAuthentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.size()").value(3))
                .andExpect(jsonPath("$.content[0].userId").value(follower1.getUserId()))
                .andExpect(jsonPath("$.content[1].userId").value(follower2.getUserId()))
                .andExpect(jsonPath("$.content[2].userId").value(follower3.getUserId()));

    }

    @Test
    void shouldNotReturnUserFollowersFromQueryBecauseOfEmptyQuery() throws Exception {
        Long loggedUserId = 99L;
        Long targetUserId = 1L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);

        doThrow(InvalidParameterException.class).when(followerService).findUserFollowers(eq(targetUserId),eq(loggedUserId),any(Pageable.class));
        mockMvc.perform(get("/social/users/"+targetUserId+"/followers")
                        .principal(mockAuthentication))
                .andExpect(status().isBadRequest());
    }
    @Test
    void shouldNotReturnUserFollowersFromQueryBecauseOfNoUser() throws Exception {
        Long loggedUserId = 99L;
        Long targetUserId = 1L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        doThrow(NoSuchElementException.class).when(followerService).findUserFollowers(eq(targetUserId),eq(loggedUserId),any(Pageable.class));
        mockMvc.perform(get("/social/users/"+targetUserId+"/followers")
                        .principal(mockAuthentication))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnUserFollowing() throws Exception {
        Long loggedUserId = 99L;
        Long targetUserId = 1L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        FollowerDTO followed1 = new FollowerDTO();
        followed1.setUserId(10L);
        FollowerDTO followed2 = new FollowerDTO();
        followed2.setUserId(20L);
        FollowerDTO followed3 = new FollowerDTO();
        followed3.setUserId(30L);
        Page<FollowerDTO> targetUserFollowing = new PageImpl<>(List.of(followed1, followed2, followed3));
        when(followerService.findUserFollowing(eq(targetUserId),eq(loggedUserId),any(Pageable.class))).thenReturn(targetUserFollowing);
        mockMvc.perform(get("/social/users/"+targetUserId+"/following")
                        .principal(mockAuthentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.size()").value(3))
                .andExpect(jsonPath("$.content[0].userId").value(followed1.getUserId()))
                .andExpect(jsonPath("$.content[1].userId").value(followed2.getUserId()))
                .andExpect(jsonPath("$.content[2].userId").value(followed3.getUserId()));

    }

    @Test
    void shouldNotReturnUserFollowingFromQueryBecauseOfEmptyQuery() throws Exception {
        Long loggedUserId = 99L;
        Long targetUserId = 1L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        doThrow(InvalidParameterException.class).when(followerService).findUserFollowing(eq(targetUserId),eq(loggedUserId),any(Pageable.class));
        mockMvc.perform(get("/social/users/"+targetUserId+"/following")
                        .principal(mockAuthentication))
                .andExpect(status().isBadRequest());
    }
    @Test
    void shouldNotReturnUserFollowingFromQueryBecauseOfNoUser() throws Exception {
        Long loggedUserId = 99L;
        Long targetUserId = 1L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        doThrow(NoSuchElementException.class).when(followerService).findUserFollowing(eq(targetUserId),eq(loggedUserId),any(Pageable.class));
        mockMvc.perform(get("/social/users/"+targetUserId+"/following")
                        .principal(mockAuthentication))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnFollowersFromQuery() throws Exception {
        Long loggedUserId = 99L;
        Long targetUserId = 1L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        FollowerDTO follower1 = new FollowerDTO();
        follower1.setUserId(10L);
        follower1.setFollowerUsername("John Smith");
        FollowerDTO follower2 = new FollowerDTO();
        follower2.setUserId(20L);
        follower2.setFollowerUsername("John Dove");
        FollowerDTO follower3 = new FollowerDTO();
        follower3.setUserId(30L);
        follower3.setFollowerUsername("John Doe");
        String query="John";
        Page<FollowerDTO> targetUserFollowers = new PageImpl<>(List.of(follower1, follower2, follower3));
        when(followerService.findFollowersByUsername(eq(query),eq(targetUserId),eq(loggedUserId),any(Pageable.class))).thenReturn(targetUserFollowers);
        mockMvc.perform(get("/social/users/search/followers")
                        .param("query",query)
                        .param("userId",String.valueOf(targetUserId))
                        .principal(mockAuthentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.size()").value(3))
                .andExpect(jsonPath("$.content[0].userId").value(follower1.getUserId()))
                .andExpect(jsonPath("$.content[1].userId").value(follower2.getUserId()))
                .andExpect(jsonPath("$.content[2].userId").value(follower3.getUserId()));

    }

    @Test
    void shouldNotReturnFollowersFromQueryBecauseOfEmptyQuery() throws Exception {
        Long loggedUserId = 99L;
        Long targetUserId = 1L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        String emptyQuery="";
        doThrow(InvalidParameterException.class).when(followerService).findFollowersByUsername(eq(emptyQuery),eq(targetUserId),eq(loggedUserId),any(Pageable.class));
        mockMvc.perform(get("/social/users/search/followers")
                        .param("query",emptyQuery)
                        .param("userId",String.valueOf(targetUserId))
                        .principal(mockAuthentication))
                .andExpect(status().isBadRequest());
    }
    @Test
    void shouldNotReturnFollowersFromQueryBecauseOfNoUser() throws Exception {
        Long loggedUserId = 99L;
        Long targetUserId = 1L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        String query="John";
        doThrow(NoSuchElementException.class).when(followerService).findFollowersByUsername(eq(query),eq(targetUserId),eq(loggedUserId),any(Pageable.class));
        mockMvc.perform(get("/social/users/search/followers")
                        .param("query",query)
                        .param("userId",String.valueOf(targetUserId))
                        .principal(mockAuthentication))
                .andExpect(status().isNotFound());
    }



    @Test
    void shouldReturnFollowingFromQuery() throws Exception {
        Long loggedUserId = 99L;
        Long targetUserId = 1L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        FollowerDTO followed1 = new FollowerDTO();
        followed1.setUserId(10L);
        followed1.setFollowerUsername("John Smith");
        FollowerDTO followed2 = new FollowerDTO();
        followed2.setUserId(20L);
        followed2.setFollowerUsername("John Dove");
        FollowerDTO followed3 = new FollowerDTO();
        followed3.setUserId(30L);
        followed3.setFollowerUsername("John Doe");
        String query="John";
        Page<FollowerDTO> targetUserFollowing = new PageImpl<>(List.of(followed1, followed2, followed3));
        when(followerService.findFollowingByUsername(eq(query),eq(targetUserId),eq(loggedUserId),any(Pageable.class))).thenReturn(targetUserFollowing);
        mockMvc.perform(get("/social/users/search/following")
                        .param("query",query)
                        .param("userId",String.valueOf(targetUserId))
                        .principal(mockAuthentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.size()").value(3))
                .andExpect(jsonPath("$.content[0].userId").value(followed1.getUserId()))
                .andExpect(jsonPath("$.content[1].userId").value(followed2.getUserId()))
                .andExpect(jsonPath("$.content[2].userId").value(followed3.getUserId()));

    }

    @Test
    void shouldNotReturnFollowingFromQueryBecauseOfEmptyQuery() throws Exception {
        Long loggedUserId = 99L;
        Long targetUserId = 1L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        String emptyQuery="";
        doThrow(InvalidParameterException.class).when(followerService).findFollowingByUsername(eq(emptyQuery),eq(targetUserId),eq(loggedUserId),any(Pageable.class));
        mockMvc.perform(get("/social/users/search/following")
                        .param("query",emptyQuery)
                        .param("userId",String.valueOf(targetUserId))
                        .principal(mockAuthentication))
                .andExpect(status().isBadRequest());
    }
    @Test
    void shouldNotReturnFollowingFromQueryBecauseOfNoUser() throws Exception {
        Long loggedUserId = 99L;
        Long targetUserId = 1L;
        Authentication mockAuthentication = createMockAuthentication(loggedUserId);
        String query="John";
        doThrow(NoSuchElementException.class).when(followerService).findFollowingByUsername(eq(query),eq(targetUserId),eq(loggedUserId),any(Pageable.class));
        mockMvc.perform(get("/social/users/search/following")
                        .param("query",query)
                        .param("userId",String.valueOf(targetUserId))
                        .principal(mockAuthentication))
                .andExpect(status().isNotFound());
    }

}