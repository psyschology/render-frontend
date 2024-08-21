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
            ticketDiv.className = 'ticket'; // Add class for styling
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
                    const td = document.createElement('td');
                    const number = ticket.numbers[i * 9 + j]; // Extract number based on matrix position
                    
                    td.className = (number !== null && number !== undefined) ? '' : 'empty'; // Empty cell styling
                    td.textContent = number || ''; // Display number or empty
                    if (calledNumbers.includes(ticket.numbers[i * 9 + j])) {
                        td.classList.add('called'); // Add class to highlight called numbers
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

    // Fill the table with called numbers, dividing into rows of up to 26 columns
    calledNumbers.forEach((number, index) => {
        if (index % 26 === 0 && index !== 0) {
            row = document.createElement('tr');
            table.appendChild(row);
        }
        const cell = document.createElement('td');
        cell.textContent = number;
        cell.className = 'called'; // Add class to highlight called numbers
        row.appendChild(cell);
    });

    // Add empty cells to fill out the last row if necessary
    const totalCells = Math.ceil(calledNumbers.length / 26) * 26;
    for (let i = calledNumbers.length; i < totalCells; i++) {
        if (i % 26 === 0 && i !== 0) {
            row = document.createElement('tr');
            table.appendChild(row);
        }
        const cell = document.createElement('td');
        cell.textContent = '';
        row.appendChild(cell);
    }

    // Clear previous content and add new table
    calledNumbersTableContainer.innerHTML = '';
    calledNumbersTableContainer.appendChild(table);
}



function updateTicketsWithCalledNumbers() {
    const ticketTables = document.querySelectorAll('.ticket-grid table');
    ticketTables.forEach(table => {
        table.querySelectorAll('td').forEach(td => {
            const number = parseInt(td.textContent);
            if (calledNumbers.includes(number)) {
                td.style.backgroundColor = 'yellow'; // Mark called numbers in yellow
            }
        });
    });
}

function announceNumber(number) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`Number ${number}`);
        speechSynthesis.speak(utterance);
    } else {
        console.warn('SpeechSynthesis is not supported in this browser.');
    }
}

// Function to generate tickets based on the rules
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

function ensureRowsHaveFiveNumbers(ticket, allNumbersUsed) {
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
                let newNumber;
                do {
                    newNumber = getRandomAvailableNumber(allNumbersUsed);
                } while (row.includes(newNumber)); // Ensure the number is not already in the row
                
                row[emptyIndices[i]] = newNumber;
                allNumbersUsed.add(newNumber); // Mark this number as used
            }
        }
    });
}

function getRandomAvailableNumber(allNumbersUsed) {
    let number;
    do {
        number = Math.floor(Math.random() * 90) + 1;
    } while (allNumbersUsed.has(number)); // Ensure the number is not already used
    
    return number;
}


// Call this function to generate the tickets
const generatedTickets = generateTickets();
console.log(generatedTickets);
