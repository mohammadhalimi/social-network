// resolvers/helpers/storyDuration.ts

export function durationToHours(duration: string): number {
    switch (duration) {
        case 'SIX_HOURS': return 6;
        case 'TWELVE_HOURS': return 12;
        case 'EIGHTEEN_HOURS': return 18;
        case 'TWENTY_FOUR_HOURS': return 24;
        default: throw new Error('مدت زمان نامعتبر است.');
    }
}

export function calculateExpiresAt(duration: string): Date {
    const hours = durationToHours(duration);
    return new Date(Date.now() + hours * 60 * 60 * 1000);
}