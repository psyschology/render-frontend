// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, set } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

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

document.getElementById('startGame').addEventListener('click', () => {
    set(ref(database, 'game'), { status: 'started' });
    console.log('Game started');
});

document.getElementById('endGame').addEventListener('click', () => {
    set(ref(database, 'game'), { status: 'ended' });
    console.log('Game ended');
});

document.getElementById('setGameTime').addEventListener('click', () => {
    const gameTime = prompt('Enter game time (YYYY-MM-DD HH:MM:SS)');
    const gameDate = prompt('Enter game date (YYYY-MM-DD)');
    set(ref(database, 'gameInfo'), {
        gameTime: gameTime,
        gameDate: gameDate
    });
    console.log('Game time and date set');
});

document.getElementById('setTicketLimit').addEventListener('click', () => {
    const ticketLimit = prompt('Enter the number of tickets');
    set(ref(database, 'tickets'), { limit: ticketLimit });
    console.log('Ticket limit set');
});

document.getElementById('bookTicket').addEventListener('click', () => {
    const ticketNumber = prompt('Enter ticket number to book');
    const ownerName = prompt('Enter owner name');
    set(ref(database, 'tickets/' + ticketNumber), { bookedBy: ownerName });
    console.log('Ticket booked');
});
