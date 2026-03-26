import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FollowButton from './FollowButton';

describe('FollowButton test', () => {
    it('renders "Follow" when isFollowing is false', () => {
        render(<FollowButton isFollowing={false} handleFollow={() => { }} />);
        const button = screen.getByRole('button', { name: /follow/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('Follow');
        expect(button).toHaveClass('bg-blue-500');
    });
    it('renders "Unfollow" when isFollowing is true', () => {
        render(<FollowButton isFollowing={true} handleFollow={() => { }} />);
        const button = screen.getByRole('button', { name: /unfollow/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('Unfollow');
        expect(button).toHaveClass('bg-gray-300');
    });
    it('calls handleFollow when clicked', () => {
        const handleFollowMock = vi.fn();
        render(<FollowButton isFollowing={false} handleFollow={handleFollowMock} />);
        const button = screen.getByRole('button', { name: /follow/i });
        fireEvent.click(button);
        expect(handleFollowMock).toHaveBeenCalledTimes(1);
    });
});
