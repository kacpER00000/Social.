package org.socialbackend.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FollowRequest {
    @NotNull
    private Long follwerId;
    @NotNull
    private Long followedId;
}
