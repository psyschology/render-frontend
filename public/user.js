// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

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

let calledNumbers = [];
let intervalId = null;

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
    const ticketsContainer = document.getElementById('tickets');
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
                    const index = i * 9 + j;
                    if (ticket.blockedIndices.includes(index)) {
                        td.textContent = ticket.numbers[index] || '';
                        if (calledNumbers.includes(ticket.numbers[index])) {
                            td.classList.add('called'); // Add class to highlight called numbers
                        }
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
        const number = Math.floor(Math.random() * 90) + 1;
        updateCalledNumbers(number);
        announceNumber(number);
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
    const container = document.getElementById(`cell-${number}`);
    if (container) {
        container.classList.add('called');
        container.style.backgroundColor = 'yellow'; // Mark the cell in yellow
    }
    updateTicketsWithCalledNumbers(); // Update ticket grids when a number is called
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
    const utterance = new SpeechSynthesisUtterance(`Number ${number}`);
    speechSynthesis.speak(utterance);
}
