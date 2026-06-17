import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pm: {
          bg:           'var(--pm-bg)',
          surface:      'var(--pm-surface)',
          'surface-up': 'var(--pm-surface-up)',
          'border-subtle': 'var(--pm-border-subtle)',
          border:       'var(--pm-border)',
          text:         'var(--pm-text)',
          'text-2':     'var(--pm-text-2)',
          muted:        'var(--pm-text-muted)',
          dim:          'var(--pm-text-dim)',
          accent:       'var(--pm-accent)',
          'accent-sub': 'var(--pm-accent-sub)',
          danger:       'var(--pm-danger)',
          'danger-sub': 'var(--pm-danger-sub)',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
