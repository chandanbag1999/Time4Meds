describe('Medication Logs Page', () => {
  beforeEach(() => {
    // Stub API responses
    cy.intercept('GET', '/api/reminders/log?limit=10&page=1', {
      statusCode: 200,
      body: {
        logs: [
          { id: 1, medicineName: "Aspirin", status: "taken", time: "Today, 08:15 AM", notes: "" },
          { id: 2, medicineName: "Vitamin D", status: "taken", time: "Today, 07:30 AM", notes: "" },
          { id: 3, medicineName: "Amoxicillin", status: "missed", time: "Yesterday, 09:00 PM", notes: "Forgot" },
        ],
        totalPages: 2,
        currentPage: 1
      }
    }).as('getLogs');

    cy.intercept('GET', '/api/reminders/log?limit=10&page=2', {
      statusCode: 200,
      body: {
        logs: [
          { id: 4, medicineName: "Ibuprofen", status: "taken", time: "2 days ago, 10:00 AM", notes: "" },
          { id: 5, medicineName: "Vitamin C", status: "skipped", time: "2 days ago, 08:00 PM", notes: "Felt better" },
        ],
        totalPages: 2,
        currentPage: 2
      }
    }).as('getMoreLogs');

    cy.intercept('GET', '/api/reminders/log/export', {
      statusCode: 200,
      headers: {
        'content-type': 'text/csv',
        'content-disposition': 'attachment; filename=medication-logs.csv'
      },
      body: 'id,medicine,status,time,notes\n1,Aspirin,taken,Today,\n'
    }).as('exportLogs');

    // Visit logs page
    cy.visit('/logs');
    cy.wait('@getLogs');
  });

  it('renders medication logs table with correct data', () => {
    // Check page title
    cy.contains('h1', 'Medication Logs').should('be.visible');
    
    // Check if table headers are rendered
    cy.contains('th', 'Medication').should('be.visible');
    cy.contains('th', 'Status').should('be.visible');
    cy.contains('th', 'Time').should('be.visible');
    
    // Check if medication names are rendered
    cy.contains('td', 'Aspirin').should('be.visible');
    cy.contains('td', 'Vitamin D').should('be.visible');
    cy.contains('td', 'Amoxicillin').should('be.visible');
    
    // Check if status badges are rendered
    cy.contains('span', 'taken').should('be.visible');
    cy.contains('span', 'missed').should('be.visible');
  });

  it('exports logs as CSV when clicking Export button', () => {
    // Click export button
    cy.contains('button', 'Export').click();
    
    // Verify export API was called
    cy.wait('@exportLogs');
    
    // Check if toast appears (assuming toast is visible in DOM)
    cy.contains('Export successful').should('be.visible');
  });

  it('navigates to log details page when clicking Details button', () => {
    // Click the first Details button
    cy.contains('button', 'Details').first().click();
    
    // Verify URL changed to log details page
    cy.url().should('include', '/logs/1');
  });

  it('loads more logs when clicking Load More button', () => {
    // Initial number of rows
    cy.get('tbody tr').should('have.length', 3);
    
    // Click Load More
    cy.contains('button', 'Load More').click();
    cy.wait('@getMoreLogs');
    
    // Check if new medications are rendered
    cy.contains('td', 'Ibuprofen').should('be.visible');
    cy.contains('td', 'Vitamin C').should('be.visible');
    
    // Total rows should now be 5
    cy.get('tbody tr').should('have.length', 5);
    
    // Load More button should be disabled after loading all pages
    cy.contains('button', 'No More Logs').should('be.disabled');
  });

  it('displays mobile view with scroll container on small screens', () => {
    // Set viewport to mobile size
    cy.viewport(375, 667);
    
    // Reload page to trigger mobile view
    cy.reload();
    cy.wait('@getLogs');
    
    // Check if the overflow container exists
    cy.get('.overflow-x-auto').should('be.visible');
    
    // In mobile view, we should see card layout instead of table
    cy.get('table').should('not.exist');
    
    // Mobile view should show medication cards
    cy.get('.divide-y > div').should('have.length', 3);
  });
}); 