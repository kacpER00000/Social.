import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AvatarCircle from './AvatarCircle';

describe('AvatarCircle test', () => {
    it('renders initials based on the username', () => {
        render(<AvatarCircle username="John Doe" size="medium" />);
        expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renders correct single initial for one-word username', () => {
        render(<AvatarCircle username="Admin" size="medium" />);
        expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('applies correct classes for small size', () => {
        const { container } = render(<AvatarCircle username="John" size="small" />);
        expect(container.firstChild).toHaveClass('w-10', 'h-10');
    });

    it('applies correct classes for medium size', () => {
        const { container } = render(<AvatarCircle username="John" size="medium" />);
        expect(container.firstChild).toHaveClass('w-20', 'h-20', 'text-2xl');
    });

    it('applies correct classes for large size', () => {
        const { container } = render(<AvatarCircle username="John" size="large" />);
        expect(container.firstChild).toHaveClass('w-30', 'h-30', 'text-4xl');
    });
});
