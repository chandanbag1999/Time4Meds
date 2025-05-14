import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import ReminderLogs from '../pages/ReminderLogs';
import apiService from '../services/api';
import { ToastProvider } from '../contexts/ToastContext';

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock API service
jest.mock('../services/api', () => ({
  get: jest.fn(),
}));

describe('ReminderLogs Page Tests', () => {
  const mockInitialLogs = {
    logs: [
      { id: "1", medicineName: "Aspirin", medicineId: "1", time: "08:00", status: "taken", date: "2023-06-01T08:15:00Z", notes: "Taken with water" },
      { id: "2", medicineName: "Vitamin D", medicineId: "2", time: "07:30", status: "missed", date: "2023-06-01T07:30:00Z", notes: "" },
      { id: "3", medicineName: "Amoxicillin", medicineId: "3", time: "20:00", status: "taken", date: "2023-05-31T20:00:00Z", notes: "After dinner" },
    ],
    totalPages: 2,
    currentPage: 1
  };
  
  const mockNextPageLogs = {
    logs: [
      { id: "4", medicineName: "Lisinopril", medicineId: "4", time: "09:00", status: "taken", date: "2023-05-31T09:00:00Z", notes: "" },
      { id: "5", medicineName: "Metformin", medicineId: "5", time: "13:00", status: "skipped", date: "2023-05-30T13:00:00Z", notes: "Felt nauseous" },
    ],
    totalPages: 2,
    currentPage: 2
  };
  
  const mockMedicines = [
    { _id: "1", name: "Aspirin" },
    { _id: "2", name: "Vitamin D" },
    { _id: "3", name: "Amoxicillin" },
    { _id: "4", name: "Lisinopril" },
    { _id: "5", name: "Metformin" }
  ];

  const renderReminderLogsPage = () => {
    return render(
      <BrowserRouter>
        <ToastProvider>
          <ReminderLogs />
        </ToastProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default to desktop view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    
    // Mock API responses
    (apiService.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/medicines')) {
        return Promise.resolve(mockMedicines);
      } else if (url.includes('page=2')) {
        return Promise.resolve(mockNextPageLogs);
      } else if (url.includes('medicineId=1')) {
        return Promise.resolve({
          logs: mockInitialLogs.logs.filter(log => log.medicineId === "1"),
          totalPages: 1,
          currentPage: 1
        });
      } else {
        return Promise.resolve(mockInitialLogs);
      }
    });
  });

  test('renders reminder logs with correct data from API', async () => {
    renderReminderLogsPage();
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(apiService.get).toHaveBeenCalledWith('/api/reminders/log?limit=10&page=1');
    });
    
    // Check if medicines are loaded in the dropdown
    expect(screen.getByText('All Medicines')).toBeInTheDocument();
    expect(screen.getByText('Aspirin')).toBeInTheDocument();
    expect(screen.getByText('Vitamin D')).toBeInTheDocument();
    
    // Check if logs are rendered
    expect(screen.getByText('Aspirin')).toBeInTheDocument();
    expect(screen.getByText('Vitamin D')).toBeInTheDocument();
    expect(screen.getByText('Amoxicillin')).toBeInTheDocument();
    
    // Check if status badges are rendered
    const takenBadges = screen.getAllByText('taken');
    const missedBadges = screen.getAllByText('missed');
    expect(takenBadges.length).toBeGreaterThanOrEqual(1);
    expect(missedBadges.length).toBeGreaterThanOrEqual(1);
    
    // Check if notes are displayed
    expect(screen.getByText('Taken with water')).toBeInTheDocument();
    expect(screen.getByText('After dinner')).toBeInTheDocument();
  });

  test('filters logs when selecting a medicine from dropdown', async () => {
    renderReminderLogsPage();
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(apiService.get).toHaveBeenCalledWith('/api/reminders/log?limit=10&page=1');
    });
    
    // Select Aspirin from the dropdown
    const dropdown = screen.getByLabelText('Filter by Medicine');
    fireEvent.change(dropdown, { target: { value: '1' } });
    
    // Check if API was called with correct filter
    await waitFor(() => {
      expect(apiService.get).toHaveBeenCalledWith('/api/reminders/log?limit=10&page=1&medicineId=1');
    });
    
    // Check if only Aspirin logs are displayed
    expect(screen.getByText('Aspirin')).toBeInTheDocument();
    expect(screen.queryByText('Vitamin D')).not.toBeInTheDocument();
    expect(screen.queryByText('Amoxicillin')).not.toBeInTheDocument();
    
    // Check if Clear button appears and works
    const clearButton = screen.getByText('Clear');
    expect(clearButton).toBeInTheDocument();
    
    fireEvent.click(clearButton);
    
    // Check if API was called with 'all' filter
    await waitFor(() => {
      expect(apiService.get).toHaveBeenCalledWith('/api/reminders/log?limit=10&page=1');
    });
  });

  test('loads more logs when clicking Load More button', async () => {
    renderReminderLogsPage();
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Load More')).toBeInTheDocument();
    });
    
    // Check initial number of logs
    const initialLogs = screen.getAllByText(/Aspirin|Vitamin D|Amoxicillin/);
    expect(initialLogs.length).toBe(3);
    
    // Click Load More
    fireEvent.click(screen.getByText('Load More'));
    
    // Check if API was called with page=2
    await waitFor(() => {
      expect(apiService.get).toHaveBeenCalledWith('/api/reminders/log?limit=10&page=2');
    });
    
    // Check if new logs are added
    expect(screen.getByText('Lisinopril')).toBeInTheDocument();
    expect(screen.getByText('Metformin')).toBeInTheDocument();
    
    // Check if all logs are now displayed
    const allLogs = screen.getAllByText(/Aspirin|Vitamin D|Amoxicillin|Lisinopril|Metformin/);
    expect(allLogs.length).toBe(5);
  });

  test('navigates to dashboard when clicking back link', async () => {
    renderReminderLogsPage();
    
    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
    });
    
    // Click the back link
    const backLink = screen.getByText('Back to Dashboard');
    fireEvent.click(backLink);
    
    // Check if navigation was triggered
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('renders responsive layout on mobile screens', async () => {
    // Set window width to mobile size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // Mobile view
    });
    
    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    const { container } = renderReminderLogsPage();
    
    // Wait for data to load
    await waitFor(() => {
      expect(apiService.get).toHaveBeenCalled();
    });
    
    // Check if filter bar is stacked vertically
    const filterBar = container.querySelector('.flex.flex-col');
    expect(filterBar).toBeInTheDocument();
    
    // Check if overflow container exists for scrolling
    const overflowContainer = container.querySelector('.overflow-x-auto');
    expect(overflowContainer).toBeInTheDocument();
    
    // Check if mobile card layout is used instead of table
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.divide-y > div').length).toBeGreaterThan(0);
  });
}); 