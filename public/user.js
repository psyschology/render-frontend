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

            // Initialize an array for columns to hold numbers
            const columns = Array.from({ length: 9 }, () => []);
            
            // Populate columns with numbers ensuring at least one number per column
            for (let col = 0; col < 9; col++) {
                const startRange = col * 10 + 1;
                const endRange = startRange + 9;
                
                // Generate exactly 3 numbers per column
                while (columns[col].length < 3) {
                    const number = getRandomNumber(startRange, endRange);
                    if (!columns[col].includes(number)) {
                        columns[col].push(number);
                    }
                }
            }

            // Sort each column in ascending order
            columns.forEach(col => col.sort((a, b) => a - b));

            // Function to create and fill rows
            const createRow = (columns, rowIndex, calledNumbers) => {
                const tr = document.createElement('tr');
                const cells = Array(9).fill(null); // Create an array with 9 empty cells

                // Place numbers in the row
                columns.forEach((col, colIndex) => {
                    if (col[rowIndex] !== undefined) {
                        cells[colIndex] = col[rowIndex];
                    }
                });

                // Ensure each row has exactly 5 numbers
                while (cells.filter(value => value !== null).length < 5) {
                    const emptyIndex = cells.indexOf(null);
                    if (emptyIndex !== -1) {
                        cells[emptyIndex] = ' ';
                    }
                }

                // Fill cells
                cells.forEach((value, colIndex) => {
                    const td = document.createElement('td');
                    td.className = value === ' ' ? 'empty' : ''; // Empty cell styling
                    td.textContent = value === ' ' ? '' : value; // Display number or empty
                    if (ticket.calledNumbers && ticket.calledNumbers.includes(value)) {
                        td.classList.add('called'); // Highlight called numbers
                    }
                    tr.appendChild(td);
                });

                return tr;
            };

            // Create 3 rows for the ticket
            for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
                const row = createRow(columns, rowIndex, ticket.calledNumbers || []);
                table.appendChild(row);
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


