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
        update(ref(database, tickets/${ticketNumber}), {
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
            row.innerHTML = 
                <td>${awardName}</td>
                <td><input type="number" id="${awardName}Amount" value="${awardDetails.amount || 0}" /></td>
            ;
            awardsTable.appendChild(row);
        }
    });
}

// Save award settings to Firebase
function saveAwardSettings() {
    const awards = {};
    const awardNames = ['fullHouse', 'firstRow']; // Add more awards as needed

    awardNames.forEach(name => {
        const amount = document.getElementById(${name}Amount).value;
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
    table.innerHTML = 
        <tr>
            <th>Award Name</th>
            <th>Price</th>
            <th>Action</th>
        </tr>
    ;

    // Populate table with awards
    awards.forEach(award => {
        const row = document.createElement('tr');
        row.innerHTML = 
            <td>${award.name}</td>
            <td><input type="text" value="${award.price}" data-id="${award.id}"></td>
            <td><button onclick="saveAward(${award.id})">Save</button></td>
        ;
        table.appendChild(row);
    });
}

// Function to save award price
function saveAward(awardId) {
    const input = document.querySelector(input[data-id="${awardId}"]);
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
