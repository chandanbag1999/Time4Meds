import React from 'react';
import ReactDOM from 'react-dom';
import DarkModeTestHelper from './DarkModeTestHelper';

/**
 * Enables the Dark Mode Testing Helper across the application
 * Import and call this function in your main App component or index.tsx to enable testing
 * 
 * @example
 * // In development mode only
 * if (process.env.NODE_ENV === 'development') {
 *   enableDarkModeTesting();
 * }
 */
export const enableDarkModeTesting = () => {
  // Create container for the test helper
  const testHelperContainer = document.createElement('div');
  testHelperContainer.id = 'dark-mode-test-helper';
  document.body.appendChild(testHelperContainer);
  
  // Render the test helper
  ReactDOM.render(
    <React.StrictMode>
      <DarkModeTestHelper />
    </React.StrictMode>,
    testHelperContainer
  );
  
  console.log('🌙 Dark Mode Testing Helper enabled');
  
  // Return a function to disable the test helper
  return () => {
    ReactDOM.unmountComponentAtNode(testHelperContainer);
    document.body.removeChild(testHelperContainer);
    console.log('🌙 Dark Mode Testing Helper disabled');
  };
};

export default enableDarkModeTesting; 