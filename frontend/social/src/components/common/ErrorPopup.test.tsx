import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorPopup from './ErrorPopup';

describe('ErrorPopup test', () => {
    it('renders errorMessage correctly', () => {
        render(<ErrorPopup error={true} errorMessage="Something went wrong!" />);
        expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    });

    it('applies visible translation class when error is true', () => {
        render(<ErrorPopup error={true} errorMessage="Visible error" />);
        const popup = screen.getByText('Visible error');
        expect(popup).toHaveClass('translate-y-0');
        expect(popup).not.toHaveClass('-translate-y-[200%]');
    });

    it('applies hidden translation class when error is false', () => {
        render(<ErrorPopup error={false} errorMessage="Hidden error" />);
        const popup = screen.getByText('Hidden error');
        expect(popup).toHaveClass('-translate-y-[200%]');
        expect(popup).not.toHaveClass('translate-y-0');
    });
});
