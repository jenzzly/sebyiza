// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2K8qqKEH_6z4OBAwMxq4shv9kxrb1QEQ",
  authDomain: "sebyiza-45270.firebaseapp.com",
  projectId: "sebyiza-45270",
  storageBucket: "sebyiza-45270.appspot.com",
  messagingSenderId: "524181431566",
  appId: "1:524181431566:web:beb1c973cb402bbd16a35f",
  measurementId: "G-2E7X08BS28"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Constants
const INITIAL_FUNDS = 50000;
const MONTHLY_CONTRIBUTION = 10000;
const INTEREST_RATE = 0.03;

// DOM elements
const currentBalanceElement = document.getElementById('current-balance');
const loanForm = document.getElementById('loan-form');
const loansList = document.getElementById('loans');
const userEmailElement = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const adminPanel = document.getElementById('admin-panel');
const approveLoansBtn = document.getElementById('approve-loans-btn');

// Initialize fund
let currentBalance = INITIAL_FUNDS;

// Update balance display
function updateBalanceDisplay() {
    currentBalanceElement.textContent = currentBalance.toFixed(2);
}

// Apply for a loan
loanForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('loan-amount').value);
    const duration = parseInt(document.getElementById('loan-duration').value);

    if (amount > currentBalance) {
        alert('Insufficient funds for this loan.');
        return;
    }

    const interest = amount * INTEREST_RATE * (duration / 12);
    const totalRepayment = amount + interest;

    try {
        await db.collection('loans').add({
            userId: auth.currentUser.uid,
            amount,
            duration,
            interest,
            totalRepayment,
            dateIssued: new Date(),
            status: 'pending'
        });

        loadLoans();
        loanForm.reset();
    } catch (error) {
        console.error('Error adding loan: ', error);
    }
});

// Load and display loans
async function loadLoans() {
    loansList.innerHTML = '';
    try {
        const snapshot = await db.collection('loans').where('userId', '==', auth.currentUser.uid).get();
        snapshot.forEach((doc) => {
            const loan = doc.data();
            const li = document.createElement('li');
            li.textContent = `Amount: $${loan.amount}, Duration: ${loan.duration} months, Total Repayment: $${loan.totalRepayment.toFixed(2)}, Status: ${loan.status}`;
            loansList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading loans: ', error);
    }
}

// Approve pending loans (admin only)
async function approvePendingLoans() {
    try {
        const snapshot = await db.collection('loans').where('status', '==', 'pending').get();
        const batch = db.batch();
        snapshot.forEach((doc) => {
            batch.update(doc.ref, { status: 'active' });
        });
        await batch.commit();
        loadLoans();
    } catch (error) {
        console.error('Error approving loans: ', error);
    }
}

// Logout
logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

// Check user role and update UI
async function checkUserRole(user) {
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    if (userData && userData.role === 'admin') {
        adminPanel.style.display = 'block';
    }
}

// Auth state change listener
auth.onAuthStateChanged(async (user) => {
    if (user) {
        userEmailElement.textContent = user.email;
        await checkUserRole(user);
        loadLoans();
        updateBalanceDisplay();
    } else {
        window.location.href = 'login.html';
    }
});

// Admin: Approve loans
approveLoansBtn.addEventListener('click', approvePendingLoans);

// Simulate monthly contribution
setInterval(() => {
    currentBalance += MONTHLY_CONTRIBUTION;
    updateBalanceDisplay();
}, 30000); // 30 seconds for demo purposes, change to 30 days (2592000000 ms) for production

// Initial setup
updateBalanceDisplay();
