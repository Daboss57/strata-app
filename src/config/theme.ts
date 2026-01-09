// STRATA Design System - "Dark Minimalist Data"
// Carbon fiber textures, neon data lines, glassmorphism

export const colors = {
    // Backgrounds - Carbon fiber aesthetic
    bgPrimary: '#0A0A0F',      // Near black
    bgSecondary: '#12121A',    // Dark carbon
    bgCard: '#1A1A24',         // Card surface
    bgCardHover: '#22222E',    // Card hover
    bgInput: '#14141E',        // Input background

    // Accent Colors - Neon Data Lines
    accentPrimary: '#00D4FF',   // Cyan neon
    accentSecondary: '#7B61FF', // Purple glow
    accentSuccess: '#00FF88',   // Green (PRs/gains)
    accentWarning: '#FFB800',   // Gold (heat check)
    accentDanger: '#FF4757',    // Red (losses/decay)

    // Tier Colors - The core ranking visual
    tierApex: '#FFD700',        // Gold - Top 5%
    tierElite: '#E040FB',       // Purple - 85-95%
    tierAdvanced: '#00E5FF',    // Cyan - 65-85%
    tierIntermediate: '#76FF03', // Lime - 40-65%
    tierNovice: '#90A4AE',      // Gray - < 40%

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0B0',
    textMuted: '#606070',
    textDisabled: '#404050',

    // Glassmorphism
    glassOverlay: 'rgba(255, 255, 255, 0.06)',
    glassBorder: 'rgba(255, 255, 255, 0.10)',
    glassHighlight: 'rgba(255, 255, 255, 0.15)',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const typography = {
    sizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 20,
        xl: 24,
        xxl: 32,
        display: 48,
        hero: 64,
    },
    weights: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
};

// Get tier color based on tier number
export function getTierColor(tier: number): string {
    switch (tier) {
        case 1: return colors.tierApex;
        case 2: return colors.tierElite;
        case 3: return colors.tierAdvanced;
        case 4: return colors.tierIntermediate;
        case 5: return colors.tierNovice;
        default: return colors.textMuted;
    }
}

// Get tier label
export function getTierLabel(tier: number): string {
    switch (tier) {
        case 1: return 'APEX';
        case 2: return 'ELITE';
        case 3: return 'ADVANCED';
        case 4: return 'INTERMEDIATE';
        case 5: return 'NOVICE';
        default: return 'UNKNOWN';
    }
}

// Get tier percentile range
export function getTierPercentile(tier: number): string {
    switch (tier) {
        case 1: return 'Top 1%';
        case 2: return 'Top 5%';
        case 3: return 'Top 15%';
        case 4: return 'Top 35%';
        case 5: return 'Top 60%';
        default: return 'unranked';
    }
}
