import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import { toast } from 'react-hot-toast';
import Home from '../pages/Home';

// Mock react-router-dom's useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Home Page Tests', () => {
  const renderHomePage = () => {
    return render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    // Reset window innerWidth for mobile tests
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024, // Default to desktop view
    });
    
    // Reset scroll position
    window.scrollTo = jest.fn();
    
    // Clear mocks
    jest.clearAllMocks();
  });

  test('CTA buttons navigate to correct routes', async () => {
    const { container } = renderHomePage();
    
    // Find all CTA buttons
    const getStartedButtons = screen.getAllByText(/Get Started/i);
    const signUpButtons = screen.getAllByText(/Sign Up Free/i);
    const loginButtons = screen.getAllByText(/Log In/i);
    
    // Check that the buttons have the correct href attributes
    expect(getStartedButtons[0].closest('a')).toHaveAttribute('href', '/register');
    expect(signUpButtons[0].closest('a')).toHaveAttribute('href', '/register');
    expect(loginButtons[0].closest('a')).toHaveAttribute('href', '/login');
    
    // Check pricing plan buttons
    const getPremiumButton = screen.getByText('Get Premium');
    const getFamilyPlanButton = screen.getByText('Get Family Plan');
    
    expect(getPremiumButton.closest('a')).toHaveAttribute('href', '/register');
    expect(getFamilyPlanButton.closest('a')).toHaveAttribute('href', '/register');
  });

  test('Newsletter form submits and shows success toast', async () => {
    renderHomePage();
    
    // Find the newsletter form
    const emailInput = screen.getByPlaceholderText('Your email address');
    const subscribeButton = screen.getByText('Subscribe');
    
    // Fill in the form and submit
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(subscribeButton);
    
    // Check that the success toast was shown
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('successfully subscribed'),
        expect.any(Object)
      );
    });
  });

  test('Mobile menu toggle works correctly', async () => {
    // Set window width to mobile size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767, // Mobile view
    });
    
    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    const { container } = renderHomePage();
    
    // Mobile menu should be hidden initially
    const mobileMenuButton = screen.getByLabelText('Toggle menu');
    expect(container.querySelector('.md\\:hidden.bg-white')).not.toBeInTheDocument();
    
    // Click the menu button to open
    fireEvent.click(mobileMenuButton);
    
    // Menu should now be visible
    await waitFor(() => {
      expect(container.querySelector('.md\\:hidden.bg-white')).toBeInTheDocument();
    });
    
    // Find and click a nav item in the mobile menu
    const featuresLink = screen.getAllByText('Features')[1]; // Second one is in mobile menu
    fireEvent.click(featuresLink);
    
    // Menu should close after clicking a nav item
    await waitFor(() => {
      expect(container.querySelector('.md\\:hidden.bg-white')).not.toBeInTheDocument();
    });
  });

  test('Scroll to section works', async () => {
    renderHomePage();
    
    // Mock scrollIntoView
    const scrollIntoViewMock = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;
    
    // Click on a nav item
    const featuresLink = screen.getAllByText('Features')[0];
    fireEvent.click(featuresLink);
    
    // Check that scrollIntoView was called
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
  });
}); 