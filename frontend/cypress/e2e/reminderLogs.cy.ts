describe('Reminder Logs Page', () => {
  beforeEach(() => {
    // Mock API responses
    cy.intercept('GET', '/api/medicines', {
      statusCode: 200,
      body: [
        { _id: "1", name: "Aspirin" },
        { _id: "2", name: "Vitamin D" },
        { _id: "3", name: "Amoxicillin" },
        { _id: "4", name: "Lisinopril" },
        { _id: "5", name: "Metformin" }
      ]
    }).as('getMedicines');

    cy.intercept('GET', '/api/reminders/log?limit=10&page=1', {
      statusCode: 200,
      body: {
        logs: [
          { id: "1", medicineName: "Aspirin", medicineId: "1", time: "08:00", status: "taken", date: "2023-06-01T08:15:00Z", notes: "Taken with water" },
          { id: "2", medicineName: "Vitamin D", medicineId: "2", time: "07:30", status: "missed", date: "2023-06-01T07:30:00Z", notes: "" },
          { id: "3", medicineName: "Amoxicillin", medicineId: "3", time: "20:00", status: "taken", date: "2023-05-31T20:00:00Z", notes: "After dinner" }
        ],
        totalPages: 2,
        currentPage: 1
      }
    }).as('getLogs');

    cy.intercept('GET', '/api/reminders/log?limit=10&page=2', {
      statusCode: 200,
      body: {
        logs: [
          { id: "4", medicineName: "Lisinopril", medicineId: "4", time: "09:00", status: "taken", date: "2023-05-31T09:00:00Z", notes: "" },
          { id: "5", medicineName: "Metformin", medicineId: "5", time: "13:00", status: "skipped", date: "2023-05-30T13:00:00Z", notes: "Felt nauseous" }
        ],
        totalPages: 2,
        currentPage: 2
      }
    }).as('getMoreLogs');

    cy.intercept('GET', '/api/reminders/log?limit=10&page=1&medicineId=1', {
      statusCode: 200,
      body: {
        logs: [
          { id: "1", medicineName: "Aspirin", medicineId: "1", time: "08:00", status: "taken", date: "2023-06-01T08:15:00Z", notes: "Taken with water" }
        ],
        totalPages: 1,
        currentPage: 1
      }
    }).as('getFilteredLogs');

    // Visit reminder logs page
    cy.visit('/logs');
    cy.wait(['@getMedicines', '@getLogs']);
  });

  it('renders reminder logs with correct data from API', () => {
    // Check page title
    cy.contains('h1', 'Reminder Logs').should('be.visible');
    
    // Check if medicines are loaded in the dropdown
    cy.get('select').should('contain', 'All Medicines');
    cy.get('select option').should('have.length', 6); // 5 medicines + All option
    
    // Check if logs are rendered in table
    cy.contains('td', 'Aspirin').should('be.visible');
    cy.contains('td', 'Vitamin D').should('be.visible');
    cy.contains('td', 'Amoxicillin').should('be.visible');
    
    // Check if status badges are rendered
    cy.contains('span', 'taken').should('be.visible');
    cy.contains('span', 'missed').should('be.visible');
    
    // Check if notes are displayed
    cy.contains('Taken with water').should('be.visible');
    cy.contains('After dinner').should('be.visible');
  });

  it('filters logs when selecting a medicine from dropdown', () => {
    // Select Aspirin from the dropdown
    cy.get('select').select('Aspirin');
    cy.wait('@getFilteredLogs');
    
    // Check if only Aspirin logs are displayed
    cy.contains('td', 'Aspirin').should('be.visible');
    cy.contains('td', 'Vitamin D').should('not.exist');
    cy.contains('td', 'Amoxicillin').should('not.exist');
    
    // Check if Clear button appears and works
    cy.contains('button', 'Clear').should('be.visible').click();
    cy.wait('@getLogs');
    
    // Check if all logs are displayed again
    cy.contains('td', 'Aspirin').should('be.visible');
    cy.contains('td', 'Vitamin D').should('be.visible');
    cy.contains('td', 'Amoxicillin').should('be.visible');
  });

  it('loads more logs when clicking Load More button', () => {
    // Check initial number of rows
    cy.get('tbody tr').should('have.length', 3);
    
    // Click Load More
    cy.contains('button', 'Load More').click();
    cy.wait('@getMoreLogs');
    
    // Check if new logs are added
    cy.contains('td', 'Lisinopril').should('be.visible');
    cy.contains('td', 'Metformin').should('be.visible');
    
    // Check if all logs are now displayed
    cy.get('tbody tr').should('have.length', 5);
    
    // Load More button should be hidden after loading all pages
    cy.contains('button', 'Load More').should('not.exist');
  });

  it('navigates to dashboard when clicking back link', () => {
    // Click the back link
    cy.contains('a', 'Back to Dashboard').click();
    
    // Check if URL changed to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('renders responsive layout on mobile screens', () => {
    // Set viewport to mobile size
    cy.viewport(375, 667);
    
    // Reload page to trigger mobile view
    cy.reload();
    cy.wait(['@getMedicines', '@getLogs']);
    
    // Check if filter bar is stacked vertically
    cy.get('.flex.flex-col').should('be.visible');
    
    // Check if overflow container exists for scrolling
    cy.get('.overflow-x-auto').should('be.visible');
    
    // Check if mobile card layout is used instead of table
    cy.get('table').should('not.exist');
    cy.get('.divide-y > div').should('have.length.at.least', 3);
    
    // Check if medicine names are displayed in cards
    cy.contains('div', 'Aspirin').should('be.visible');
    cy.contains('div', 'Vitamin D').should('be.visible');
    cy.contains('div', 'Amoxicillin').should('be.visible');
  });
}); 