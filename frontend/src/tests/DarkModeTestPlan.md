# Dark Mode Testing Plan for Time4Meds

## Overview
This document outlines the testing plan for verifying dark mode functionality across all pages and components of the Time4Meds application. The goal is to ensure a consistent, accessible, and visually appealing dark mode experience for users.

## Testing Environment
- Test on multiple browsers: Chrome, Firefox, Safari, Edge
- Test on desktop and mobile breakpoints
- Test with system dark mode preference enabled/disabled
- Test with manual toggle of dark mode

## Test Cases

### 1. Theme Toggle Functionality

- [ ] Verify the theme toggle button is visible and accessible on all pages
- [ ] Confirm toggle switches between light and dark mode correctly
- [ ] Verify theme preference is saved in localStorage and persists between sessions
- [ ] Test system preference detection works correctly
- [ ] Verify theme changes are applied immediately without page refresh

### 2. Global Layout Elements

- [ ] Verify main layout background changes to `dark:bg-gray-900`
- [ ] Check navbar styling in dark mode (`dark:bg-gray-800` or similar)
- [ ] Verify footer styling in dark mode
- [ ] Ensure all borders use appropriate dark mode colors (`dark:border-gray-700` or similar)
- [ ] Check container backgrounds in dark mode

### 3. Typography

- [ ] Verify all headings have appropriate dark mode text colors (`dark:text-gray-100` or similar)
- [ ] Check paragraph text for proper contrast (`dark:text-gray-300` or similar)
- [ ] Verify secondary/muted text has appropriate dark mode styling (`dark:text-gray-400` or similar)
- [ ] Test links for proper visibility and hover states in dark mode

### 4. Form Elements

- [ ] Test input fields for proper dark mode styling:
  - Background: `dark:bg-gray-800`
  - Border: `dark:border-gray-600`
  - Text: `dark:text-gray-100`
  - Placeholder: `dark:placeholder-gray-500`
  - Focus states: `dark:focus:ring-indigo-500 dark:focus:border-indigo-500`
- [ ] Check select dropdowns for dark mode styling
- [ ] Verify checkbox and radio inputs in dark mode
- [ ] Test textarea elements in dark mode

### 5. Buttons

- [ ] Verify primary buttons (`dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:text-white`)
- [ ] Check secondary buttons (`dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200`)
- [ ] Test outline buttons (`dark:border-gray-600 dark:text-gray-200 dark:hover:border-gray-500`)
- [ ] Verify ghost buttons (`dark:text-gray-300 dark:hover:bg-gray-800`)
- [ ] Check link buttons (`dark:text-indigo-400 dark:hover:text-indigo-300`)
- [ ] Test danger buttons (`dark:bg-red-700 dark:hover:bg-red-800`)
- [ ] Verify disabled button states in dark mode

### 6. Cards and Containers

- [ ] Check card backgrounds (`dark:bg-gray-800`)
- [ ] Verify card borders (`dark:border-gray-700`)
- [ ] Test card shadows (`dark:shadow-gray-900/20`)
- [ ] Check card headers and footers in dark mode

### 7. Tables

- [ ] Verify table headers (`dark:bg-gray-800/60 dark:text-gray-300`)
- [ ] Check table rows (`dark:hover:bg-gray-800/70`)
- [ ] Test selected rows (`dark:data-[state=selected]:bg-gray-700/50`)
- [ ] Verify table cell text (`dark:text-gray-200`)
- [ ] Check table dividers (`dark:divide-gray-700`)

### 8. Modals and Dialogs

- [ ] Verify modal backgrounds (`dark:bg-gray-800`)
- [ ] Check modal borders (`dark:border-gray-700`)
- [ ] Test modal overlays/backdrops in dark mode
- [ ] Verify modal close buttons in dark mode

### 9. Notifications and Toasts

- [ ] Check toast backgrounds for different types (success, error, warning, info)
- [ ] Verify toast text colors in dark mode
- [ ] Test toast borders in dark mode
- [ ] Verify toast icons in dark mode

### 10. Page-Specific Elements

#### Dashboard Page
- [ ] Verify medicine cards in dark mode
- [ ] Check reminder sections in dark mode
- [ ] Test statistics/charts in dark mode

#### Add/Edit Medicine Pages
- [ ] Verify form styling in dark mode
- [ ] Check time input styling in dark mode
- [ ] Test validation messages in dark mode

#### Authentication Pages
- [ ] Verify login form in dark mode
- [ ] Check register form in dark mode
- [ ] Test forgot password form in dark mode

#### Error Pages
- [ ] Verify 404 page in dark mode
- [ ] Check other error pages in dark mode

#### Landing Page
- [ ] Verify hero section in dark mode
- [ ] Check feature cards in dark mode
- [ ] Test testimonial section in dark mode
- [ ] Verify call-to-action sections in dark mode

### 11. Accessibility Testing

- [ ] Verify color contrast meets WCAG AA standards (minimum 4.5:1 for normal text)
- [ ] Check focus indicators are visible in dark mode
- [ ] Test screen reader compatibility with dark mode
- [ ] Verify no flashing or flickering during theme transitions

### 12. Edge Cases

- [ ] Test with high contrast mode enabled
- [ ] Verify behavior when switching themes while forms are partially filled
- [ ] Check theme persistence after browser updates
- [ ] Test with browser zoom levels (100%, 150%, 200%)
- [ ] Verify print styles in dark mode

## Test Reporting

For each issue found:
1. Screenshot the issue
2. Note the browser/device information
3. Document the steps to reproduce
4. Describe the expected vs. actual behavior
5. Assign a severity level (Critical, High, Medium, Low)

## Regression Testing

After fixing any dark mode issues:
- Retest the specific component/page where the issue was found
- Verify the fix doesn't introduce new issues in related components
- Test in both light and dark modes to ensure proper functionality in both themes 