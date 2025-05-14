import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import Logs from '../pages/Logs';
import apiService, { api } from '../services/api';
import { ToastProvider } from '../contexts/ToastContext';

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock API service
jest.mock('../services/api', () => ({
  api: {
    get: jest.fn(),
  },
  default: {
    get: jest.fn(),
  },
}));

// Mock window.URL.createObjectURL
const mockCreateObjectURL = jest.fn();
window.URL.createObjectURL = mockCreateObjectURL;

describe('Logs Page Tests', () => {
  const mockLogs = {
    logs: [
      { id: 1, medicineName: "Aspirin", status: "taken", time: "Today, 08:15 AM", notes: "" },
      { id: 2, medicineName: "Vitamin D", status: "taken", time: "Today, 07:30 AM", notes: "" },
      { id: 3, medicineName: "Amoxicillin", status: "missed", time: "Yesterday, 09:00 PM", notes: "Forgot" },
    ],
    totalPages: 2,
    currentPage: 1
  };
  
  const mockMoreLogs = {
    logs: [
      { id: 4, medicineName: "Ibuprofen", status: "taken", time: "2 days ago, 10:00 AM", notes: "" },
      { id: 5, medicineName: "Vitamin C", status: "skipped", time: "2 days ago, 08:00 PM", notes: "Felt better" },
    ],
    totalPages: 2,
    currentPage: 2
  };

  const renderLogsPage = () => {
    return render(
      <BrowserRouter>
        <ToastProvider>
          <Logs />
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
      if (url.includes('page=1')) {
        return Promise.resolve(mockLogs);
      } else if (url.includes('page=2')) {
        return Promise.resolve(mockMoreLogs);
      }
      return Promise.resolve({ logs: [], totalPages: 0, currentPage: 1 });
    });
    
    // Mock blob response for export
    (api.get as jest.Mock).mockImplementation(() => {
      return Promise.resolve({
        data: new Blob(['mock,csv,data'], { type: 'text/csv' }),
      });
    });
  });

  test('renders medication logs table with correct data', async () => {
    renderLogsPage();
    
    // Wait for data to load
    await waitFor(() => {
      expect(apiService.get).toHaveBeenCalledWith('/api/reminders/log?limit=10&page=1');
    });
    
    // Check if table headers are rendered
    expect(screen.getByText('Medication')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    
    // Check if medication names are rendered
    expect(screen.getByText('Aspirin')).toBeInTheDocument();
    expect(screen.getByText('Vitamin D')).toBeInTheDocument();
    expect(screen.getByText('Amoxicillin')).toBeInTheDocument();
    
    // Check if status badges are rendered
    const statusBadges = screen.getAllByText(/taken|missed|skipped/);
    expect(statusBadges.length).toBe(3);
  });

  test('clicking Export button triggers file download', async () => {
    renderLogsPage();
    
    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Export')).toBeInTheDocument();
    });
    
    // Click export button
    fireEvent.click(screen.getByText('Export'));
    
    // Check if API was called
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/reminders/log/export', { responseType: 'blob' });
    });
    
    // Check if createObjectURL was called to create download link
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  test('clicking Details button navigates to log details page', async () => {
    renderLogsPage();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getAllByText('Details').length).toBeGreaterThan(0);
    });
    
    // Click the first Details button
    fireEvent.click(screen.getAllByText('Details')[0]);
    
    // Check if navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith('/logs/1');
  });

  test('clicking Load More loads additional rows', async () => {
    renderLogsPage();
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Load More')).toBeInTheDocument();
    });
    
    // Initial number of rows
    const initialRows = screen.getAllByText(/Aspirin|Vitamin D|Amoxicillin/);
    expect(initialRows.length).toBe(3);
    
    // Click Load More
    fireEvent.click(screen.getByText('Load More'));
    
    // Wait for additional data to load
    await waitFor(() => {
      expect(apiService.get).toHaveBeenCalledWith('/api/reminders/log?limit=10&page=2');
    });
    
    // Check if new medications are rendered
    expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
    expect(screen.getByText('Vitamin C')).toBeInTheDocument();
    
    // Total rows should now be 5
    const allRows = screen.getAllByText(/Aspirin|Vitamin D|Amoxicillin|Ibuprofen|Vitamin C/);
    expect(allRows.length).toBe(5);
  });

  test('renders mobile view with scroll container on small screens', async () => {
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
    
    const { container } = renderLogsPage();
    
    // Wait for data to load
    await waitFor(() => {
      expect(apiService.get).toHaveBeenCalled();
    });
    
    // Check if the overflow container exists
    expect(container.querySelector('.overflow-x-auto')).toBeInTheDocument();
    
    // In mobile view, we should see card layout instead of table
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    
    // Mobile view should show medication cards
    const medicationCards = container.querySelectorAll('.px-4.py-3.flex.flex-col.gap-2');
    expect(medicationCards.length).toBe(3);
  });
}); 