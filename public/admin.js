// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, set, update } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9hgV5BCLAXQC4-MhcEfadzJCRVcwp8CQ",
  authDomain: "render-27de6.firebaseapp.com",
  databaseURL: "https://render-27de6-default-rtdb.firebaseio.com",
  projectId: "render-27de6",
  storageBucket: "render-27de6.appspot.com",
  messagingSenderId: "401163347854",
  appId: "1:401163347854:web:d95d1a655d256c731766df",
  measurementId: "G-M87PVBCQJN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Elements
const startGameButton = document.getElementById('startGame');
const endGameButton = document.getElementById('endGame');
const setGameTimeButton = document.getElementById('setGameTime');
const setTicketLimitButton = document.getElementById('setTicketLimit');
const bookTicketButton = document.getElementById('bookTicket');

// Prompt for password on page load
document.addEventListener('DOMContentLoaded', () => {
    const password = prompt('Enter password:');
    if (password !== 'jaybasotia') {
        alert('Incorrect password');
        window.location.href = 'about:blank'; // Redirect to a blank page if the password is incorrect
    }
});

startGameButton.addEventListener('click', () => {
    set(ref(database, 'gameInfo/status'), 'started');
    set(ref(database, 'gameInfo/board'), generateBoardNumbers());
});

endGameButton.addEventListener('click', () => {
    set(ref(database, 'gameInfo/status'), 'ended');
    set(ref(database, 'gameInfo/board'), null); // Clear the board
    set(ref(database, 'calledNumbers'), []);
});

setGameTimeButton.addEventListener('click', () => {
    const gameTime = prompt("Enter the game start time (YYYY-MM-DDTHH:MM:SSZ):");
    const gameDate = prompt("Enter the game start date (YYYY-MM-DD):");
    if (gameTime && gameDate) {
        update(ref(database, 'gameInfo'), {
            gameTime: gameTime,
            gameDate: gameDate
        });
    }
});

setTicketLimitButton.addEventListener('click', () => {
    const limit = prompt("Enter the number of tickets:");
    if (limit) {
        const tickets = {};

       function generateTickets() {
    // Initialize the number ranges for each column
    const columns = [
        Array.from({ length: 9 }, (_, i) => i + 1),        // Column 1: 1-9
        Array.from({ length: 10 }, (_, i) => i + 10),      // Column 2: 10-19
        Array.from({ length: 10 }, (_, i) => i + 20),      // Column 3: 20-29
        Array.from({ length: 10 }, (_, i) => i + 30),      // Column 4: 30-39
        Array.from({ length: 10 }, (_, i) => i + 40),      // Column 5: 40-49
        Array.from({ length: 10 }, (_, i) => i + 50),      // Column 6: 50-59
        Array.from({ length: 10 }, (_, i) => i + 60),      // Column 7: 60-69
        Array.from({ length: 10 }, (_, i) => i + 70),      // Column 8: 70-79
        Array.from({ length: 11 }, (_, i) => i + 80)       // Column 9: 80-90
    ];

    // Shuffle numbers within each column
    columns.forEach(column => column.sort(() => Math.random() - 0.5));

    // Initialize 6 tickets, each as a 3x9 matrix filled with nulls
    const tickets = Array.from({ length: 6 }, () => Array.from({ length: 3 }, () => Array(9).fill(null)));

    // Distribute numbers across tickets while following the rules
    for (let ticketIndex = 0; ticketIndex < 6; ticketIndex++) {
        const ticket = tickets[ticketIndex];
        
        columns.forEach((columnNumbers, colIndex) => {
            // Select 5 random numbers from the column
            const numCount = Math.min(5, columnNumbers.length);
            const selectedNumbers = [];
            
            for (let i = 0; i < numCount; i++) {
                const randomIndex = Math.floor(Math.random() * columnNumbers.length);
                selectedNumbers.push(columnNumbers[randomIndex]);
                columnNumbers.splice(randomIndex, 1); // Remove used number
            }

            // Distribute selected numbers to the rows in ascending order
            selectedNumbers.forEach((number, rowIndex) => {
                if (rowIndex < 3) {
                    ticket[rowIndex][colIndex] = number;
                }
            });
        });

        // Ensure that each row has exactly 5 numbers
        ensureRowsHaveFiveNumbers(ticket);
    }

    // Shuffle the rows of each ticket to randomize the distribution while keeping the column-wise sorting
    tickets.forEach(ticket => {
        ticket.forEach(row => row.sort((a, b) => (a === null ? 1 : b === null ? -1 : a - b)));
    });

    return tickets;
}

function ensureRowsHaveFiveNumbers(ticket) {
    const rows = [0, 1, 2];
    rows.forEach(rowIndex => {
        const row = ticket[rowIndex];
        const filledCount = row.filter(num => num !== null).length;
        
        // If a row has fewer than 5 numbers, fill the empty spots
        if (filledCount < 5) {
            const emptyIndices = row.map((num, idx) => num === null ? idx : -1).filter(idx => idx !== -1);
            const fillCount = 5 - filledCount;
            
            // Fill empty spots with random numbers from the column constraints
            for (let i = 0; i < fillCount; i++) {
                const randomIndex = Math.floor(Math.random() * emptyIndices.length);
                const emptyIdx = emptyIndices[randomIndex];
                row[emptyIdx] = getRandomAvailableNumber(); // Function to get a valid number from the pool
                emptyIndices.splice(randomIndex, 1); // Remove filled spot
            }
        }
    });
}

function getRandomAvailableNumber() {
    // Implement logic to return a random available number from the 1-90 pool
    // Ensure it hasn't been used already in the tickets
    // Placeholder for demonstration purposes
    return Math.floor(Math.random() * 90) + 1;
}

// Call this function to generate the tickets
const generatedTickets = generateTickets();
console.log(generatedTickets);


        // Generate tickets based on the specified limit
        for (let i = 1; i <= limit; i++) {
            tickets[i] = generateTicket();
        }

        // Store the tickets in Firebase
        set(ref(database, 'tickets'), tickets);
    }
});



bookTicketButton.addEventListener('click', () => {
    const ticketNumber = prompt("Enter the ticket number to book:");
    const ownerName = prompt("Enter the owner's name:");
    if (ticketNumber && ownerName) {
        update(ref(database, `tickets/${ticketNumber}`), {
            bookedBy: ownerName
        });
    }
});

function generateBoardNumbers() {
    const board = Array.from({ length: 90 }, (_, i) => i + 1);
    return board;
}
// Load award settings and display them in the admin interface
function loadAwardSettings() {
    onValue(ref(database, 'awardSettings'), (snapshot) => {
        const awards = snapshot.val();
        const awardsTable = document.getElementById('awardsTable');
        awardsTable.innerHTML = ''; // Clear previous content

        for (const [awardName, awardDetails] of Object.entries(awards)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${awardName}</td>
                <td><input type="number" id="${awardName}Amount" value="${awardDetails.amount || 0}" /></td>
            `;
            awardsTable.appendChild(row);
        }
    });
}

// Save award settings to Firebase
function saveAwardSettings() {
    const awards = {};
    const awardNames = ['fullHouse', 'firstRow']; // Add more awards as needed

    awardNames.forEach(name => {
        const amount = document.getElementById(`${name}Amount`).value;
        awards[name] = { amount: parseFloat(amount) };
    });

    set(ref(database, 'awardSettings'), awards);
}

// Event listener for the save button
document.getElementById('saveAwardsButton').addEventListener('click', saveAwardSettings);

// Initialize the settings when the admin page loads
loadAwardSettings();

//UPDATE 11:25 am
// admin.js

// Function to display the awards table
function displayAwardsTable() {
    const awards = getLoadedAwards(); // Fetch the loaded awards
    const table = document.getElementById('awards-table');
    table.innerHTML = ''; // Clear existing content

    // Create table headers
    table.innerHTML = `
        <tr>
            <th>Award Name</th>
            <th>Price</th>
            <th>Action</th>
        </tr>
    `;

    // Populate table with awards
    awards.forEach(award => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${award.name}</td>
            <td><input type="text" value="${award.price}" data-id="${award.id}"></td>
            <td><button onclick="saveAward(${award.id})">Save</button></td>
        `;
        table.appendChild(row);
    });
}

// Function to save award price
function saveAward(awardId) {
    const input = document.querySelector(`input[data-id="${awardId}"]`);
    const price = input.value;

    // Save the price to the database
    updateAwardPrice(awardId, price)
        .then(response => {
            if (response.success) {
                alert('Award price updated successfully!');
            } else {
                alert('Failed to update award price.');
            }
        });
}

// Mock function to get loaded awards
function getLoadedAwards() {
    // Replace with actual logic to fetch awards
    return [
        { id: 1, name: 'First Full House', price: '1000' },
        { id: 2, name: 'Second Full House', price: '500' },
        // Add more awards as needed
    ];
}

// Mock function to update award price
function updateAwardPrice(awardId, price) {
    // Replace with actual API call to save award price
    return new Promise(resolve => {
        setTimeout(() => resolve({ success: true }), 500);
    });
}

// Initialize the awards table
displayAwardsTable();
