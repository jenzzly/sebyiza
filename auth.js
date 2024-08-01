// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

const authForm = document.getElementById('auth-form');
const toggleAuth = document.getElementById('toggle-auth');
let isLoginMode = true;

toggleAuth.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    authForm.querySelector('h2').textContent = isLoginMode ? 'Login' : 'Register';
    toggleAuth.textContent = isLoginMode ? 'Register' : 'Login';
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        if (isLoginMode) {
            await auth.signInWithEmailAndPassword(email, password);
        } else {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await db.collection('users').doc(userCredential.user.uid).set({
                email: email,
                role: 'user'
            });
        }
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Authentication error:', error);
        alert(error.message);
    }
});

auth.onAuthStateChanged((user) => {
    if (user) {
        window.location.href = 'index.html';
    }
});
