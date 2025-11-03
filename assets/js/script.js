const contrastToggle = document.getElementById("contrastToggle");
const contrastToggleMobile = document.getElementById("contrastToggleMobile");
const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const body = document.body;

function toggleHighContrast() {
  body.classList.toggle("high-contrast");
  const isHighContrast = body.classList.contains("high-contrast");
  localStorage.setItem("highContrast", isHighContrast);

  const buttons = [contrastToggle, contrastToggleMobile];
  buttons.forEach((btn) => {
    if (btn) {
      btn.setAttribute("aria-pressed", isHighContrast);
    }
  });
}

if (localStorage.getItem("highContrast") === "true") {
  body.classList.add("high-contrast");
  [contrastToggle, contrastToggleMobile].forEach((btn) => {
    if (btn) btn.setAttribute("aria-pressed", "true");
  });
}

contrastToggle.addEventListener("click", toggleHighContrast);
contrastToggleMobile.addEventListener("click", toggleHighContrast);

mobileMenuToggle.addEventListener("click", () => {
  const isExpanded =
    mobileMenu.style.maxHeight !== "0px" && mobileMenu.style.maxHeight !== "";
  mobileMenu.style.maxHeight = isExpanded
    ? "0px"
    : mobileMenu.scrollHeight + "px";
  mobileMenuToggle.setAttribute("aria-expanded", !isExpanded);
});

const mobileLinks = mobileMenu.querySelectorAll("a");
mobileLinks.forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.style.maxHeight = "0px";
    mobileMenuToggle.setAttribute("aria-expanded", "false");
  });
});

const audio = new Audio("assets/audio/id.mp3");
let isPlaying = false;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

audio.addEventListener("loadedmetadata", () => {
  document.getElementById("totalTime").textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  const progress = (audio.currentTime / audio.duration) * 100;
  document.getElementById("audioProgress").style.width = progress + "%";
  document.getElementById("currentTime").textContent = formatTime(
    audio.currentTime
  );
});

audio.addEventListener("ended", () => {
  isPlaying = false;
  updatePlayButton(false);
  document.getElementById("audioStatus").textContent = "Selesai diputar";
  audio.currentTime = 0;
});

audio.addEventListener("error", () => {
  document.getElementById("audioStatus").textContent =
    "Error: File audio tidak ditemukan";
  alert(
    "File audio tidak ditemukan di assets/audio/id.mp3. Pastikan file tersebut ada."
  );
});

function playScreenReaderSimulation() {
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    updatePlayButton(false);
    document.getElementById("audioStatus").textContent = "Dijeda";
    return;
  }

  audio
    .play()
    .then(() => {
      isPlaying = true;
      updatePlayButton(true);
      document.getElementById("audioStatus").textContent = "Sedang diputar...";
    })
    .catch((err) => {
      console.error("Error playing audio:", err);
      document.getElementById("audioStatus").textContent =
        "Gagal memutar audio";
      alert("Gagal memutar audio. Pastikan file ada di assets/audio/id.mp3");
    });
}

function updatePlayButton(playing) {
  const playPauseBtn = document.getElementById("playPauseBtn");
  const icon = playPauseBtn.querySelector("i");

  if (playing) {
    icon.classList.remove("fa-play");
    icon.classList.add("fa-pause");
    playPauseBtn.setAttribute("aria-label", "Pause screen reader audio");
  } else {
    icon.classList.remove("fa-pause");
    icon.classList.add("fa-play");
    playPauseBtn.setAttribute("aria-label", "Play screen reader audio");
  }
}

document
  .getElementById("playPauseBtn")
  .addEventListener("click", playScreenReaderSimulation);
document.getElementById("heroScreenReaderBtn").addEventListener("click", () => {
  document.getElementById("simulasi").scrollIntoView({ behavior: "smooth" });
  setTimeout(playScreenReaderSimulation, 500);
});

document.getElementById("stopBtn").addEventListener("click", () => {
  audio.pause();
  audio.currentTime = 0;
  isPlaying = false;
  updatePlayButton(false);
  document.getElementById("audioStatus").textContent = "Dihentikan";
  document.getElementById("audioProgress").style.width = "0%";
  document.getElementById("currentTime").textContent = "0:00";
});

const challengeCards = document.querySelectorAll(".challenge-card");
const startChallengeBtn = document.getElementById("startChallengeBtn");
const toggleMouseBtn = document.getElementById("toggleMouseBtn");
const challengeStatus = document.getElementById("challengeStatus");
const challengeMessage = document.getElementById("challengeMessage");
const successMessage = document.getElementById("successMessage");

let visitedCards = new Set();
let challengeActive = false;

startChallengeBtn.addEventListener("click", () => {
  challengeActive = true;
  visitedCards.clear();
  challengeStatus.classList.remove("hidden");
  successMessage.classList.add("hidden");
  challengeMessage.textContent =
    "Tekan Tab untuk memulai navigasi. Kunjungi semua 6 kartu!";

  challengeCards.forEach((card) => {
    card.style.backgroundColor = "";
  });
});

toggleMouseBtn.addEventListener("click", () => {
  body.classList.toggle("no-mouse");
  const isNoMouse = body.classList.contains("no-mouse");
  toggleMouseBtn.innerHTML = isNoMouse
    ? '<i class="fas fa-mouse-pointer mr-2" aria-hidden="true"></i>Tampilkan Kursor'
    : '<i class="fas fa-mouse-pointer mr-2" aria-hidden="true"></i>Sembunyikan Kursor';
});

challengeCards.forEach((card) => {
  card.addEventListener("focus", () => {
    if (challengeActive) {
      const cardNum = card.getAttribute("data-card");
      if (!visitedCards.has(cardNum)) {
        visitedCards.add(cardNum);
        card.style.backgroundColor = "#d1fae5";

        challengeMessage.textContent = `Kartu ${visitedCards.size} dari 6 dikunjungi. Terus navigasi dengan Tab!`;

        if (visitedCards.size === 6) {
          successMessage.classList.remove("hidden");
          challengeMessage.textContent =
            "Sempurna! Anda berhasil menavigasi semua kartu!";
          challengeActive = false;
        }
      }
    }
  });

  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      card.style.transform = "scale(0.95)";
      setTimeout(() => {
        card.style.transform = "";
      }, 100);
    }
  });
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});
