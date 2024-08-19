const ws = new WebSocket('wss://render-backend-yrah.onrender.com');

// Elements
const gameBoard = document.getElementById('game-board');
const calledNumbers = document.getElementById('called-numbers');
const nextGameTime = document.getElementById('next-game-time');
const nextGameDate = document.getElementById('next-game-date');
const timeLeft = document.getElementById('time-left');
const ticketsContainer = document.getElementById('tickets-container');

 console.log('Connected to the WebSocket server');
};

ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};


ws.onmessage = (event) => {
    
    const data = JSON.parse(event.data);

    if (data.type === 'START_GAME') {
        createGameBoard();
        callOutNumbers(data.numbers);
    } else if (data.type === 'END_GAME') {
        resetGameBoard();
    } else if (data.type === 'SET_GAME_TIME') {
        nextGameTime.textContent = `Next Game Time: ${data.time}`;
        nextGameDate.textContent = `Next Game Date: ${data.date}`;
        timeLeft.textContent = `Time Left: ${data.timeLeft}`;
    } else if (data.type === 'SET_TICKET_LIMIT') {
        createTickets(data.limit);
    } else if (data.type === 'BOOK_TICKET') {
        bookTicket(data.ticketNumber, data.ownerName);
    }
};

// Create the game board
function createGameBoard() {
    gameBoard.innerHTML = ''; // Clear any previous board
    for (let i = 1; i <= 90; i++) {
        const cell = document.createElement('div');
        cell.textContent = i;
        gameBoard.appendChild(cell);
    }
}

// Call out numbers
function callOutNumbers(numbers) {
    calledNumbers.innerHTML = ''; // Clear previous numbers
    numbers.forEach(num => {
        const cell = gameBoard.children[num - 1];
        cell.classList.add('yellow');
        
        const numberDiv = document.createElement('div');
        numberDiv.textContent = num;
        calledNumbers.appendChild(numberDiv);
    });
}

// Reset the game board
function resetGameBoard() {
    gameBoard.innerHTML = '';
    calledNumbers.innerHTML = '';
}

// Create tickets
function createTickets(limit) {
    ticketsContainer.innerHTML = ''; // Clear previous tickets
    for (let i = 1; i <= limit; i++) {
        const ticketDiv = document.createElement('div');
        ticketDiv.className = 'ticket';
        
        const ticketNumber = document.createElement('div');
        ticketNumber.className = 'ticket-number';
        ticketNumber.textContent = `Ticket ${i}`;
        
        const ticketDetails = document.createElement('div');
        ticketDetails.className = 'ticket-details';
        
        const grid = document.createElement('div');
        grid.className = 'ticket-grid';
        // Create a 3x9 grid
        for (let j = 0; j < 27; j++) {
            const box = document.createElement('div');
            grid.appendChild(box);
        }
        
        ticketDetails.appendChild(grid);
        ticketDiv.appendChild(ticketNumber);
        ticketDiv.appendChild(ticketDetails);
        
        ticketsContainer.appendChild(ticketDiv);
    }
}

// Book a ticket
function bookTicket(ticketNumber, ownerName) {
    const ticketDiv = ticketsContainer.children[ticketNumber - 1];
    const ticketNumberDiv = ticketDiv.querySelector('.ticket-number');
    ticketNumberDiv.textContent += ` (Booked by ${ownerName})`;
}

