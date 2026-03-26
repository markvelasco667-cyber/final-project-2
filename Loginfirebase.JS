import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCFOVxEcJaa1EPm1wqYOX3jb3ir7AWdM6g",
  authDomain: "craftright-eea86.firebaseapp.com",
  databaseURL: "https://craftright-eea86-default-rtdb.firebaseio.com",
  projectId: "craftright-eea86",
  storageBucket: "craftright-eea86.firebasestorage.app",
  messagingSenderId: "281493881421",
  appId: "1:281493881421:web:9a55778a375d2d74511204",
  measurementId: "G-RJ5SVSL5FW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const submitBtn = document.getElementById("submit");
const authMsg = document.getElementById("auth-msg");

// Friendly error messages instead of raw Firebase codes
function getFriendlyError(code) {
  switch (code) {
    case "auth/user-not-found":      return "No account found with that email.";
    case "auth/wrong-password":      return "Incorrect password. Try again!";
    case "auth/invalid-email":       return "Please enter a valid email.";
    case "auth/too-many-requests":   return "Too many attempts. Take a break!";
    case "auth/invalid-credential":  return "Wrong email or password.";
    default:                         return "Login failed. Please try again.";
  }
}

submitBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Basic validation
  if (!email || !password) {
    authMsg.textContent = "Please fill in all fields.";
    return;
  }

  submitBtn.textContent = "Loading...";
  submitBtn.style.opacity = "0.7";
  authMsg.textContent = "";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    submitBtn.textContent = "✔ Welcome back!";
    setTimeout(() => {
      window.location.href = "Home.html";
    }, 800);
  } catch (error) {
    authMsg.textContent = getFriendlyError(error.code);
    submitBtn.textContent = "▶ Login";
    submitBtn.style.opacity = "1";
  }
});

// Allow pressing Enter to submit
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitBtn.click();
});