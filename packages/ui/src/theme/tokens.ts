export const colors = {
  // Brand
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Status colors
  status: {
    pending: '#3b82f6',     // blue
    fulfilled: '#22c55e',   // green
    rejected: '#ef4444',    // red
    uninitialized: '#9ca3af', // gray
  },

  // Neutrals
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#0a0f1a',
  },
} as const

export interface Theme {
  bg: {
    primary: string
    secondary: string
    tertiary: string
    hover: string
    active: string
    panel: string
    overlay: string
  }
  text: {
    primary: string
    secondary: string
    tertiary: string
    inverse: string
    link: string
  }
  border: {
    primary: string
    secondary: string
    focus: string
  }
  status: {
    pending: string
    fulfilled: string
    rejected: string
    uninitialized: string
  }
  brand: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
}

export const lightTheme: Theme = {
  bg: {
    primary: '#ffffff',
    secondary: colors.gray[50],
    tertiary: colors.gray[100],
    hover: colors.gray[100],
    active: colors.purple[50],
    panel: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  text: {
    primary: colors.gray[900],
    secondary: colors.gray[600],
    tertiary: colors.gray[400],
    inverse: '#ffffff',
    link: colors.purple[600],
  },
  border: {
    primary: colors.gray[200],
    secondary: colors.gray[100],
    focus: colors.purple[500],
  },
  status: colors.status,
  brand: colors.purple,
}

export const darkTheme: Theme = {
  bg: {
    primary: colors.gray[900],
    secondary: colors.gray[800],
    tertiary: colors.gray[700],
    hover: colors.gray[700],
    active: 'rgba(168, 85, 247, 0.1)',
    panel: colors.gray[950],
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  text: {
    primary: colors.gray[50],
    secondary: colors.gray[400],
    tertiary: colors.gray[500],
    inverse: colors.gray[900],
    link: colors.purple[400],
  },
  border: {
    primary: colors.gray[700],
    secondary: colors.gray[800],
    focus: colors.purple[500],
  },
  status: colors.status,
  brand: colors.purple,
}

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
} as const

export const fontSize = {
  xs: '11px',
  sm: '12px',
  md: '13px',
  lg: '14px',
  xl: '16px',
} as const

export const fontFamily = {
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: '"SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", Menlo, Courier, monospace',
} as const

export const borderRadius = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  full: '9999px',
} as const
