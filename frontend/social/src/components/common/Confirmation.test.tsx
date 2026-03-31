import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Confirmation from './Confirmation';

describe('Confirmation test', () => {
    it('does not render when show is false', () => {
        render(<Confirmation show={false} onChoose={() => { }} />);
        expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
    });

    it('renders confirmation dialog when show is true', () => {
        render(<Confirmation show={true} onChoose={() => { }} />);
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
    });

    it('calls onChoose with true when Yes is clicked', () => {
        const onChooseMock = vi.fn();
        render(<Confirmation show={true} onChoose={onChooseMock} />);
        const yesButton = screen.getByRole('button', { name: 'Yes' });
        fireEvent.click(yesButton);
        expect(onChooseMock).toHaveBeenCalledWith(true);
        expect(onChooseMock).toHaveBeenCalledTimes(1);
    });

    it('calls onChoose with false when No is clicked', () => {
        const onChooseMock = vi.fn();
        render(<Confirmation show={true} onChoose={onChooseMock} />);
        const noButton = screen.getByRole('button', { name: 'No' });
        fireEvent.click(noButton);
        expect(onChooseMock).toHaveBeenCalledWith(false);
        expect(onChooseMock).toHaveBeenCalledTimes(1);
    });
});
