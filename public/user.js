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

// Update UI based on game state
function updateGameBoard(data) {
    if (data.status === 'started') {
        gameBoard.style.display = 'block';
        generateBoard(data.board);
        startNumberCalling();
    } else if (data.status === 'ended') {
        gameBoard.style.display = 'none';
        stopNumberCalling();
    }
}

// Function to generate the game board
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

// Function to start calling numbers
function startNumberCalling() {
    // Implement number calling logic here
    // Update the `calledNumbers` array and call `updateCalledNumbers()` on each new number
}

// Function to stop calling numbers
function stopNumberCalling() {
    // Implement logic to stop calling numbers
}

function updateCalledNumbers(number) {
    calledNumbers.push(number);
    const container = document.createElement('div');
    container.textContent = number;
    container.classList.add('highlight');
    calledNumbersContainer.appendChild(container);
    
    const cell = document.getElementById(`cell-${number}`);
    if (cell) {
        cell.classList.add('highlight');
    }
}

// Update game info
onValue(ref(database, 'gameInfo'), (snapshot) => {
    const gameInfo = snapshot.val();
    nextGameTime.textContent = `Next Game Time: ${gameInfo.gameTime || 'N/A'}`;
    nextGameDate.textContent = `Next Game Date: ${gameInfo.gameDate || 'N/A'}`;
    // Calculate and update time left
});

// Update tickets
onValue(ref(database, 'tickets'), (snapshot) => {
    const tickets = snapshot.val();
    ticketsContainer.innerHTML = '';
    for (const [ticketNumber, ticket] of Object.entries(tickets)) {
        if (ticketNumber !== 'limit') {
            const ticketDiv = document.createElement('div');
            ticketDiv.innerHTML = `
                <div>Ticket ${ticketNumber}</div>
                <div>
                    ${ticket.bookedBy ? `Booked by: ${ticket.bookedBy}` : `<a href="https://wa.me/99999" target="_blank">Book Now</a>`}
                </div>
                <div id="ticket-${ticketNumber}" class="ticket-grid"></div>
            `;
            ticketsContainer.appendChild(ticketDiv);
            generateTicketGrid(ticketNumber);
        }
    }
});

function generateTicketGrid(ticketNumber) {
    const container = document.getElementById(`ticket-${ticketNumber}`);
    const numbers = Array.from({ length: 27 }, (_, i) => i + 1);
    const ticketNumbers = [...new Set([...numbers].sort(() => Math.random() - 0.5)).slice(0, 15)];

    let gridHtml = '<table>';
    for (let row = 0; row < 3; row++) {
        gridHtml += '<tr>';
        for (let col = 0; col < 9; col++) {
            const number = ticketNumbers.find(n => Math.floor((n - 1) / 9) === col);
            gridHtml += `<td class="${number ? 'highlight' : 'blocked'}">${number || ''}</td>`;
        }
        gridHtml += '</tr>';
    }
    gridHtml += '</table>';
    container.innerHTML = gridHtml;
}
