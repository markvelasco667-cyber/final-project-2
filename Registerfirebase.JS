import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const db = getDatabase(app);

// NOTE: Removed Firestore — using only Realtime Database to keep things simple and avoid
// needing two separate DB imports. If you want Firestore too, add it back below.

const submitBtn = document.getElementById("submit");
const authMsg = document.getElementById("auth-msg");

function getFriendlyError(code) {
  switch (code) {
    case "auth/email-already-in-use": return "That email is already registered.";
    case "auth/invalid-email":        return "Please enter a valid email.";
    case "auth/weak-password":        return "Password needs at least 6 characters.";
    default:                          return "Registration failed. Please try again.";
  }
}

submitBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  authMsg.textContent = "";

  if (!username || !email || !password) {
    authMsg.textContent = "Please fill in all fields.";
    return;
  }
  if (username.length < 3) {
    authMsg.textContent = "Username must be at least 3 characters.";
    return;
  }

  submitBtn.textContent = "Creating...";
  submitBtn.style.opacity = "0.7";

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save player profile to Realtime Database
    await set(ref(db, "users/" + user.uid), {
      username: username,
      email: email,
      xp: 0,
      level: 0,
      activePet: "Chicken",
      createdAt: Date.now()
    });

    submitBtn.textContent = "✔ Account Created!";
    setTimeout(() => {
      window.location.href = "Login.html";
    }, 1000);

  } catch (error) {
    console.error("Registration error:", error);
    authMsg.textContent = getFriendlyError(error.code);
    submitBtn.textContent = "⚒ Register";
    submitBtn.style.opacity = "1";
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitBtn.click();
});
