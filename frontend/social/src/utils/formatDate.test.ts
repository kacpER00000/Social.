import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe("formatDate utility", () => {
    it("should correctly format date and time", () => {
        const inputDate = '2023-08-15T14:30:00+02:00';
        const result = formatDate(inputDate);
        expect(result).toBe('15.08.2023 14:30');
    })
    it("should correctly add leading zeros to single-digit days and months", () => {
        const inputDate = '2024-03-05T09:05:00+01:00';
        const result = formatDate(inputDate);
        expect(result).toBe('05.03.2024 09:05');
    })
    it("should return 'Invalid Date' for invalid date string", () => {
        const inputDate = 'to-nie-jest-data';
        const result = formatDate(inputDate);
        expect(result).toBe('Invalid Date');
    })
})