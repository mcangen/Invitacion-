import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, serverTimestamp,
  query, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// ======= CONFIGURACIÓN =======
const EVENT_DATE = new Date(2026, 9, 3, 21, 30, 0); // 3 de octubre de 2026, 9:30 PM (mes 9 = octubre, 0-indexado)
const WHATSAPP_NUMBER = "573114214930"; // Colombia (+57) + 311 421 4930. Cambia el código de país si no es Colombia.

// ======= FIREBASE =======
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rsvpsRef = collection(db, "rsvps");

// ======= AUDIO / PANTALLA DE INICIO =======
const overlay = document.getElementById("start-overlay");
const startBtn = document.getElementById("start-btn");
const music = document.getElementById("bg-music");
const muteBtn = document.getElementById("mute-btn");

function enterParty() {
  music.muted = false;
  music.volume = 0.6;
  music.play().catch(() => {
    // Si el navegador bloquea el audio, se podrá activar con el botón de mute
  });
  overlay.classList.add("hidden");
}

// Todos los navegadores (Edge, Chrome, Safari, Firefox) exigen un clic real
// del usuario antes de permitir sonido, así que la pantalla de inicio se
// mantiene visible hasta que se toque el botón; esto garantiza la música
// en el primer clic, en vez de fallar en silencio como con el autoplay "mudo".
startBtn.addEventListener("click", enterParty);

muteBtn.addEventListener("click", () => {
  music.muted = !music.muted;
  muteBtn.textContent = music.muted ? "🔇" : "🔊";
  if (!music.muted && music.paused) {
    music.play().catch(() => {});
  }
});

// ======= RSVP: MODAL + FIREBASE =======
const rsvpBtn = document.getElementById("rsvp-btn");
const nameModal = document.getElementById("name-modal");
const nameForm = document.getElementById("name-form");
const nameInput = document.getElementById("name-input");
const modalCancelBtn = document.getElementById("modal-cancel-btn");
const confirmadosList = document.getElementById("confirmados-list");
const confirmadosCount = document.getElementById("confirmados-count");

rsvpBtn.addEventListener("click", () => {
  nameModal.classList.add("visible");
  nameInput.focus();
});

modalCancelBtn.addEventListener("click", () => {
  nameModal.classList.remove("visible");
});

nameModal.addEventListener("click", (e) => {
  if (e.target === nameModal) nameModal.classList.remove("visible");
});

nameForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;

  try {
    await addDoc(rsvpsRef, { name, timestamp: serverTimestamp() });
  } catch (err) {
    console.error("No se pudo guardar en Firebase:", err);
    alert("No se pudo guardar tu confirmación, pero de igual forma te llevamos a WhatsApp.");
  }

  const whatsappMessage = `¡Hola! 🎉 Soy ${name} y confirmo que SÍ voy a tu cumpleaños. ¡Nos vemos para bailar y disfrutar! 🥳🍾`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`, "_blank");

  nameInput.value = "";
  nameModal.classList.remove("visible");
});

// Lista de confirmados en vivo
onSnapshot(query(rsvpsRef, orderBy("timestamp", "asc")), (snapshot) => {
  confirmadosList.innerHTML = "";
  snapshot.forEach((doc) => {
    const li = document.createElement("li");
    li.textContent = doc.data().name;
    confirmadosList.appendChild(li);
  });
  confirmadosCount.textContent = snapshot.size;
});

// ======= CONTADOR REGRESIVO =======
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const countdownMsg = document.getElementById("countdown-msg");
const countdownBox = document.getElementById("countdown");

function pad(n) { return String(n).padStart(2, "0"); }

function updateCountdown() {
  const now = new Date();
  const diff = EVENT_DATE - now;

  if (diff <= 0) {
    countdownBox.style.display = "none";
    countdownMsg.textContent = "🎉 ¡Es HOY! Nos vemos en la fiesta 🎉";
    clearInterval(timer);
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  daysEl.textContent = pad(days);
  hoursEl.textContent = pad(hours);
  minutesEl.textContent = pad(minutes);
  secondsEl.textContent = pad(seconds);
  countdownMsg.textContent = "Faltan para la rumba ";
}

updateCountdown();
const timer = setInterval(updateCountdown, 1000);

// ======= CONFETI DE FONDO =======
const confettiCanvas = document.getElementById("confetti-canvas");
const colors = ["#ff2ec4", "#17f5ff", "#ffd166", "#ffffff"];

function createConfetti(count) {
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    const size = 6 + Math.random() * 6;
    piece.style.width = `${size}px`;
    piece.style.height = `${size * 0.4}px`;
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${6 + Math.random() * 6}s`;
    piece.style.animationDelay = `${Math.random() * 8}s`;
    confettiCanvas.appendChild(piece);
  }
}

createConfetti(40);
