// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, onValue, set } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

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
const gameBoard = document.getElementById('gameBoard');
const nextGameTime = document.getElementById('nextGameTime');
const nextGameDate = document.getElementById('nextGameDate');
const timeLeft = document.getElementById('timeLeft');
const ticketsContainer = document.getElementById('tickets');
const calledNumbersContainer = document.getElementById('calledNumbers');
const calledNumbersTableContainer = document.getElementById('calledNumbersTable'); // New element for the called numbers table

let calledNumbers = [];
let intervalId = null;
let numberPool = []; // To hold shuffled numbers 1-90

// Initialize the number pool
function initializeNumberPool() {
    numberPool = Array.from({ length: 90 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
}

// Update UI based on game state
onValue(ref(database, 'gameInfo'), (snapshot) => {
    const gameInfo = snapshot.val();
    if (gameInfo) {
        nextGameTime.textContent = `Next Game Time: ${gameInfo.gameTime || 'N/A'}`;
        nextGameDate.textContent = `Next Game Date: ${gameInfo.gameDate || 'N/A'}`;

        // Calculate time left
        if (gameInfo.gameTime) {
            const now = new Date();
            const gameTime = new Date(gameInfo.gameTime);
            const timeDiff = gameTime - now;
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            timeLeft.textContent = `Time Left: ${hours}h ${minutes}m`;
        }
    } else {
        nextGameTime.textContent = 'Next Game Time: N/A';
        nextGameDate.textContent = 'Next Game Date: N/A';
        timeLeft.textContent = 'Time Left: N/A';
    }
});

onValue(ref(database, 'gameInfo/status'), (snapshot) => {
    const status = snapshot.val();
    if (status === 'started') {
        initializeNumberPool();
        onValue(ref(database, 'gameInfo/board'), (snapshot) => {
            const board = snapshot.val();
            if (board) {
                gameBoard.style.display = 'block';
                generateBoard(board);
                startNumberCalling();
            }
        });
    } else if (status === 'ended') {
        gameBoard.style.display = 'none';
        stopNumberCalling();
    }
});

onValue(ref(database, 'calledNumbers'), (snapshot) => {
    const numbers = snapshot.val() || [];
    calledNumbers = numbers;
    updateCalledNumbersTable();
    calledNumbersContainer.innerHTML = numbers.map(number => `<span class="called-number">${number}</span>`).join(' ');

    // Update board with called numbers
    numbers.forEach(number => {
        const cell = document.getElementById(`cell-${number}`);
        if (cell) {
            cell.classList.add('called');
            cell.style.backgroundColor = 'yellow'; // Mark the cell in yellow
        }
    });

    // Update tickets with called numbers
    updateTicketsWithCalledNumbers();
});

// Fetch the tickets and render them
onValue(ref(database, 'tickets'), (snapshot) => {
    const tickets = snapshot.val();
    ticketsContainer.innerHTML = ''; // Clear previous content

    for (const [ticketNumber, ticket] of Object.entries(tickets)) {
        if (ticketNumber !== 'limit') {
            const ticketDiv = document.createElement('div');
            ticketDiv.className = 'dynamic-ticket'; // Add class for styling
            ticketDiv.innerHTML = `
                <div class="ticket-header">Ticket ${ticketNumber}</div>
                <div class="ticket-owner">
                    ${ticket.bookedBy ? `Booked by: ${ticket.bookedBy}` : `<a href="https://wa.me/99999" target="_blank">Book Now</a>`}
                </div>
                <div id="ticket-${ticketNumber}" class="ticket-grid"></div>
            `;
            ticketsContainer.appendChild(ticketDiv);

            const ticketGrid = document.getElementById(`ticket-${ticketNumber}`);
            const table = document.createElement('table');
            table.className = 'ticket-table'; // Add a class for styling

            for (let i = 0; i < 3; i++) {
                const tr = document.createElement('tr');
                for (let j = 0; j < 9; j++) {
                    const index = i * 9 + j;
                    const td = document.createElement('td');

                    // Handle filled and blocked cells
                    if (ticket.numbers[index] !== null) {
                        td.className = 'filled'; // Filled cells
                        td.textContent = ticket.numbers[index];
                        if (calledNumbers.includes(ticket.numbers[index])) {
                            td.classList.add('called'); // Highlight called numbers
                        }
                    } else {
                        td.className = 'blocked'; // Blocked cells
                    }

                    tr.appendChild(td);
                }
                table.appendChild(tr);
            }
            ticketGrid.appendChild(table);
        }
    }
});




function generateBoard(board) {
    const table = document.createElement('table');
    for (let i = 0; i < 9; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < 10; j++) {
            const td = document.createElement('td');
            const num = board[i * 10 + j];
            td.textContent = num;
            td.id = `cell-${num}`;
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    gameBoard.innerHTML = '';
    gameBoard.appendChild(table);
}

function startNumberCalling() {
    intervalId = setInterval(() => {
        if (numberPool.length > 0) {
            const number = numberPool.shift(); // Take the first number from the shuffled pool
            updateCalledNumbers(number);
            announceNumber(number);
        } else {
            stopNumberCalling();
        }
    }, 2000); // Adjust interval as needed
}

function stopNumberCalling() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

function updateCalledNumbers(number) {
    calledNumbers.push(number);
    set(ref(database, 'calledNumbers'), calledNumbers);
    const container = document.getElementById(`cell-${number}`);
    if (container) {
        container.classList.add('called');
        container.style.backgroundColor = 'yellow'; // Mark the cell in yellow
    }
    updateTicketsWithCalledNumbers(); // Update ticket grids when a number is called
    updateCalledNumbersTable(); // Update the called numbers table
}

function updateCalledNumbersTable() {
    const table = document.createElement('table');
    table.className = 'called-numbers-table'; // Add class for styling

    let row = document.createElement('tr');
    table.appendChild(row);

    // Fill the table with called numbers, dividing into rows of up to 22 columns
    calledNumbers.forEach((number, index) => {
        if (index % 22 === 0 && index !== 0) {
            row = document.createElement('tr');
            table.appendChild(row);
        }
        const cell = document.createElement('td');
        cell.textContent = number;
        cell.className = 'called'; // Add class to highlight called numbers
        row.appendChild(cell);
    });

    // Add empty cells to fill out the last row if necessary
    const totalCells = Math.ceil(calledNumbers.length / 22) * 22;
    const emptyCells = totalCells - calledNumbers.length;
    for (let i = 0; i < emptyCells; i++) {
        const cell = document.createElement('td');
        cell.className = 'empty'; // Class for empty cells
        row.appendChild(cell);
    }

    calledNumbersTableContainer.innerHTML = ''; // Clear previous content
    calledNumbersTableContainer.appendChild(table);
}

function updateTicketsWithCalledNumbers() {
    const tickets = document.getElementsByClassName('ticket-table');
    Array.from(tickets).forEach(ticket => {
        Array.from(ticket.getElementsByTagName('td')).forEach(cell => {
            const number = parseInt(cell.textContent);
            if (calledNumbers.includes(number)) {
                cell.classList.add('called');
                cell.style.backgroundColor = 'yellow'; // Mark the cell in yellow
            }
        });
    });
}

function announceNumber(number) {
    const msg = new SpeechSynthesisUtterance(number.toString());
    msg.lang = 'en-IN'; // Set language for Indian English accent
    speechSynthesis.speak(msg);
}

function generateTicket() {
    const ticketNumbers = Array(27).fill(null); // 27 cells for the ticket
    const usedNumbers = new Set();

    for (let row = 0; row < 3; row++) {
        const rowNumbers = new Set();

        // Randomly select 5 unique columns out of 9 for this row
        const selectedColumns = new Set();
        while (selectedColumns.size < 5) {
            const col = Math.floor(Math.random() * 9);
            selectedColumns.add(col);
        }

        selectedColumns.forEach(col => {
            let min = col * 10 + 1;
            let max = col * 10 + 10;

            if (col === 0) min = 1; // Adjust for 1-9 range
            if (col === 8) max = 90; // Adjust for 81-90 range

            const possibleNumbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);
            let chosenNumber;

            // Ensure the chosen number is unique and hasn't been used
            do {
                chosenNumber = possibleNumbers[Math.floor(Math.random() * possibleNumbers.length)];
            } while (usedNumbers.has(chosenNumber));

            rowNumbers.add(chosenNumber);
            usedNumbers.add(chosenNumber);

            // Place the number in the ticket at the correct position
            ticketNumbers[row * 9 + col] = chosenNumber;
        });
    }

    return { numbers: ticketNumbers };
}
