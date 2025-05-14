# Dark Mode Implementation in Time4Meds

This document provides an overview of the dark mode implementation in the Time4Meds application, including usage guidelines, testing procedures, and extension patterns.

## Table of Contents

1. [Overview](#overview)
2. [Implementation Details](#implementation-details)
3. [Usage Guidelines](#usage-guidelines)
4. [Color Palette](#color-palette)
5. [Testing](#testing)
6. [Extending Dark Mode](#extending-dark-mode)
7. [Accessibility Considerations](#accessibility-considerations)
8. [Troubleshooting](#troubleshooting)

## Overview

Time4Meds implements a comprehensive dark mode that follows Tailwind CSS conventions using the `dark:` variant prefix. The dark mode can be toggled manually by users or automatically based on system preferences.

## Implementation Details

### Core Components

- **ThemeContext**: Manages theme state and provides theme-related functionality
- **ThemeProvider**: Wraps the application and applies the theme to the DOM
- **ThemeToggle**: UI component for users to switch between light and dark modes

### How It Works

1. The `ThemeProvider` initializes the theme based on:
   - User's saved preference in localStorage
   - System preference via `prefers-color-scheme` media query
   - Default to light mode if neither is available

2. When the theme changes:
   - The `dark` class is added to or removed from the `html` element
   - The theme value is saved to localStorage

3. Tailwind's dark mode variant (`dark:`) applies styling when the `dark` class is present on the `html` element

## Usage Guidelines

### Adding Dark Mode to Components

To add dark mode support to a component, use Tailwind's `dark:` variant:

```jsx
<div className="bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200">
  Dark mode compatible content
</div>
```

### Using the Theme in Components

```jsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>
        Switch to {isDark ? 'light' : 'dark'} mode
      </button>
    </div>
  );
}
```

## Color Palette

The dark mode implementation uses the following color palette:

### Backgrounds
- Primary: `dark:bg-gray-900` (Page backgrounds)
- Secondary: `dark:bg-gray-800` (Card backgrounds, form elements)
- Tertiary: `dark:bg-gray-700` (Hover states, accents)

### Text
- Primary: `dark:text-gray-100` (Headings, important text)
- Secondary: `dark:text-gray-300` (Body text)
- Tertiary: `dark:text-gray-400` (Muted text, captions)

### Borders
- Primary: `dark:border-gray-700` (Card borders, dividers)
- Secondary: `dark:border-gray-600` (Form elements)

### Accent Colors
- Primary: `dark:bg-indigo-600`, `dark:text-indigo-400` (Buttons, links)
- Success: `dark:bg-green-700`, `dark:text-green-400`
- Warning: `dark:bg-yellow-700`, `dark:text-yellow-400`
- Error: `dark:bg-red-700`, `dark:text-red-400`

## Testing

### Manual Testing

1. Use the Dark Mode Testing Helper:
   ```jsx
   // In your development environment only
   import { enableDarkModeTesting } from '@/tests/enableDarkModeTesting';
   
   if (process.env.NODE_ENV === 'development') {
     enableDarkModeTesting();
   }
   ```

2. Follow the test plan in `tests/DarkModeTestPlan.md`

### Automated Testing

For component testing with Jest and React Testing Library:

```jsx
import { ThemeProvider } from '@/contexts/ThemeContext';
import { render } from '@testing-library/react';

// Mock the theme context for dark mode
jest.mock('@/contexts/ThemeContext', () => ({
  ...jest.requireActual('@/contexts/ThemeContext'),
  useTheme: () => ({
    theme: 'dark',
    toggleTheme: jest.fn(),
    isDark: true
  })
}));

test('Component renders correctly in dark mode', () => {
  const { container } = render(
    <ThemeProvider>
      <YourComponent />
    </ThemeProvider>
  );
  
  // Your assertions here
});
```

## Extending Dark Mode

### Adding Dark Mode to New Components

1. Follow the color palette guidelines
2. Use existing dark mode patterns from similar components
3. Test in both light and dark modes
4. Ensure proper contrast ratios for accessibility

### Adding New Color Variants

When adding new colors to the palette:

1. Define both light and dark mode variants
2. Ensure sufficient contrast in both modes
3. Update this documentation

## Accessibility Considerations

- Maintain a minimum contrast ratio of 4.5:1 for normal text (WCAG AA)
- Ensure focus indicators are visible in dark mode
- Test with screen readers to verify proper announcements
- Avoid pure black backgrounds (use `dark:bg-gray-900` instead)

## Troubleshooting

### Common Issues

1. **Dark mode not applying**:
   - Check if the `dark` class is present on the `html` element
   - Verify that dark mode variants are correctly defined

2. **Flickering on theme change**:
   - Use `transition-colors` for smooth transitions
   - Avoid transitioning layout properties

3. **Inconsistent styling**:
   - Ensure all components use the standard color palette
   - Check for missing dark mode variants

### Debugging

Use the browser's developer tools to:
1. Inspect the `html` element for the `dark` class
2. Check localStorage for the saved theme preference
3. Test the `prefers-color-scheme` media query

For more complex issues, use the Dark Mode Testing Helper to identify problematic components. 