# Medication Logs Filter Functionality

This document provides an overview of the filter functionality implemented for the Medication Logs page in the Time4Meds application.

## Table of Contents

1. [Overview](#overview)
2. [Filter Options](#filter-options)
3. [Implementation Details](#implementation-details)
4. [Usage Guide](#usage-guide)
5. [API Integration](#api-integration)
6. [Extending the Filters](#extending-the-filters)

## Overview

The Medication Logs filter functionality allows users to narrow down their medication logs based on various criteria such as medicine name, status, date range, and sorting preferences. This feature helps users find specific logs more efficiently and organize their medication history according to their needs.

## Filter Options

The filter modal provides the following options:

1. **Medicine Filter**: Allows filtering logs by a specific medication
2. **Status Filter**: Filters logs by status (taken, missed, skipped)
3. **Date Range**: Filters logs within a specific date range (from/to)
4. **Sorting Options**:
   - Sort by: Date, Medicine name, or Status
   - Sort order: Newest first (descending) or Oldest first (ascending)

## Implementation Details

The filter functionality is implemented using the following components:

1. **LogFilterModal**: A modal component that displays filter options and handles filter changes
2. **ActiveFilters**: A component that displays currently active filters with the ability to remove individual filters
3. **Logs Page**: The main page that integrates these components and manages filter state

### Key Files

- `src/components/LogFilterModal.tsx`: The filter modal component
- `src/components/ActiveFilters.tsx`: The active filters display component
- `src/pages/Logs.tsx`: The main logs page that integrates the filter functionality

## Usage Guide

### Opening the Filter Modal

1. Navigate to the Medication Logs page
2. Click the "Filter" button in the top-right corner
3. The filter modal will open, displaying all available filter options

### Applying Filters

1. Select your desired filter options in the modal
2. Click "Apply Filters" to apply the selected filters
3. The logs will be filtered according to your selections
4. Active filters will be displayed below the page header

### Removing Filters

You can remove filters in two ways:

1. **Remove Individual Filters**: Click the "X" icon next to any active filter tag
2. **Clear All Filters**: Click the "Clear all" link to reset all filters

### Exporting Filtered Data

When you export logs using the "Export" button, the current filters will be applied to the exported data, ensuring that you only export the logs you're currently viewing.

## API Integration

The filter functionality integrates with the backend API by:

1. Building query parameters based on selected filters
2. Appending these parameters to API requests
3. Handling pagination with filters maintained across page loads

### API Endpoint Structure

```
/api/reminders/log?limit=10&page=${page}&medicineId=${medicineId}&status=${status}&dateFrom=${dateFrom}&dateTo=${dateTo}&sortBy=${sortBy}&sortOrder=${sortOrder}
```

## Extending the Filters

To add new filter options:

1. Update the `LogFilters` interface in `LogFilterModal.tsx`
2. Add the new filter UI elements to the modal component
3. Update the `buildApiUrl` function in `Logs.tsx` to include the new filter parameters
4. Add handling for the new filter in the `ActiveFilters` component

### Example: Adding a "Notes" Filter

To add a filter for searching in the notes field:

1. Update the `LogFilters` interface:
   ```typescript
   export interface LogFilters {
     // existing filters
     notesSearch?: string; // Add this line
   }
   ```

2. Add the UI element to the modal:
   ```jsx
   <div>
     <label htmlFor="notesSearch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
       Search in Notes
     </label>
     <input
       type="text"
       id="notesSearch"
       name="notesSearch"
       value={filters.notesSearch || ''}
       onChange={handleChange}
       className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
       placeholder="Search text in notes..."
     />
   </div>
   ```

3. Update the `buildApiUrl` function:
   ```typescript
   if (currentFilters.notesSearch) {
     url += `&notesSearch=${encodeURIComponent(currentFilters.notesSearch)}`;
   }
   ```

4. Add handling in the `getFilterLabel` function:
   ```typescript
   case 'notesSearch':
     return `Notes: ${value}`;
   ``` 