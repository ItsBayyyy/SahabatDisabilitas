// High Contrast Mode
const contrastToggle = document.getElementById("contrastToggle");
const contrastToggleMobile = document.getElementById("contrastToggleMobile");
const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const backToTopBtn = document.getElementById("backToTop");
const body = document.body;

function toggleHighContrast() {
    body.classList.toggle("high-contrast");
    const isHighContrast = body.classList.contains("high-contrast");
    localStorage.setItem("highContrast", isHighContrast);

    const buttons = [contrastToggle, contrastToggleMobile];
    buttons.forEach((btn) => {
        if (btn) {
            btn.setAttribute("aria-pressed", isHighContrast);
            btn.innerHTML = isHighContrast
                ? '<i class="fas fa-sun mr-2" aria-hidden="true"></i><span>Mode Normal</span>'
                : '<i class="fas fa-adjust mr-2" aria-hidden="true"></i><span>Kontras Tinggi</span>';
        }
    });
}

function toggleBackToTop() {
  const scrollY = window.pageYOffset;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  
  const scrollProgress = scrollY / (documentHeight - windowHeight);
  const progressPercentage = Math.min(scrollProgress * 100, 100);

  updateProgressCircle(progressPercentage);

  if (scrollY > 500 || (documentHeight - scrollY - windowHeight) < 100) {
      backToTopBtn.classList.remove("hide");
      backToTopBtn.classList.add("show");
  } else {
      backToTopBtn.classList.remove("show");
      backToTopBtn.classList.add("hide");
  }
}

function updateProgressCircle(progress) {
  const progressCircle = document.getElementById("progressCircle");
  if (!progressCircle) return;
  
  // Calculate dashoffset (283 is circumference: 2 * π * 45)
  const circumference = 2 * Math.PI * 45;
  const dashoffset = circumference - (progress / 100) * circumference;
  
  progressCircle.style.strokeDashoffset = dashoffset;
  
  if (progress > 80) {
      progressCircle.style.stroke = "#f97316"; // Orange when near bottom
  } else if (progress > 50) {
      progressCircle.style.stroke = "#3b82f6"; // Blue
  } else {
      progressCircle.style.stroke = "#ffffff"; // White
  }
}

function scrollToTop() {
  window.scrollTo({
      top: 0,
      behavior: "smooth"
  });
  
  setTimeout(() => {
      updateProgressCircle(0);
  }, 300);
  
  setTimeout(() => {
      const skipLink = document.querySelector('a[href="#main-content"]');
      if (skipLink) {
          skipLink.focus();
      }
  }, 500);
}

// Initialize high contrast mode
if (localStorage.getItem("highContrast") === "true") {
    body.classList.add("high-contrast");
    [contrastToggle, contrastToggleMobile].forEach((btn) => {
        if (btn) {
            btn.setAttribute("aria-pressed", "true");
            btn.innerHTML = '<i class="fas fa-sun mr-2" aria-hidden="true"></i><span>Mode Normal</span>';
        }
    });
}

// Keyboard support untuk back to top
backToTopBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        scrollToTop();
    }
});

// Back to Top Event Listeners
backToTopBtn.addEventListener("click", scrollToTop);
window.addEventListener("scroll", toggleBackToTop);
window.addEventListener("resize", toggleBackToTop);

// Initialize back to top
document.addEventListener("DOMContentLoaded", toggleBackToTop);

contrastToggle.addEventListener("click", toggleHighContrast);
contrastToggleMobile.addEventListener("click", toggleHighContrast);

// Mobile Menu
mobileMenuToggle.addEventListener("click", () => {
    const isExpanded = mobileMenu.style.maxHeight !== "0px" && mobileMenu.style.maxHeight !== "";
    mobileMenu.style.maxHeight = isExpanded ? "0px" : mobileMenu.scrollHeight + "px";
    mobileMenuToggle.setAttribute("aria-expanded", !isExpanded);
    
    // Update icon
    const icon = mobileMenuToggle.querySelector("i");
    icon.className = isExpanded ? "fas fa-bars text-2xl" : "fas fa-times text-2xl";
});

const mobileLinks = mobileMenu.querySelectorAll("a");
mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
        mobileMenu.style.maxHeight = "0px";
        mobileMenuToggle.setAttribute("aria-expanded", "false");
        const icon = mobileMenuToggle.querySelector("i");
        icon.className = "fas fa-bars text-2xl";
    });
});

// Audio Player with Transcript Highlighting
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
    document.getElementById("currentTime").textContent = formatTime(audio.currentTime);
    
    // Highlight current transcript paragraph
    highlightTranscript(audio.currentTime);
});

function highlightTranscript(currentTime) {
    const paragraphs = document.querySelectorAll("#transcript p");
    paragraphs.forEach((para, index) => {
        const startTime = index * 7; // Each paragraph gets ~7 seconds
        const endTime = (index + 1) * 7;
        
        if (currentTime >= startTime && currentTime < endTime) {
            para.classList.add("transcript-highlight");
        } else {
            para.classList.remove("transcript-highlight");
        }
    });
}

audio.addEventListener("ended", () => {
    isPlaying = false;
    updatePlayButton(false);
    document.getElementById("audioStatus").textContent = "Selesai diputar";
    audio.currentTime = 0;
    
    // Remove all highlights
    document.querySelectorAll("#transcript p").forEach(p => {
        p.classList.remove("transcript-highlight");
    });
});

audio.addEventListener("error", () => {
    document.getElementById("audioStatus").textContent = "Error: File audio tidak ditemukan";
    console.error("Audio file not found at assets/audio/id.mp3");
});

function playScreenReaderSimulation() {
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        updatePlayButton(false);
        document.getElementById("audioStatus").textContent = "Dijeda";
        return;
    }

    audio.play().then(() => {
        isPlaying = true;
        updatePlayButton(true);
        document.getElementById("audioStatus").textContent = "Sedang diputar...";
    }).catch((err) => {
        console.error("Error playing audio:", err);
        document.getElementById("audioStatus").textContent = "Gagal memutar audio";
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

// Event Listeners for Audio
document.getElementById("playPauseBtn").addEventListener("click", playScreenReaderSimulation);
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
    
    // Remove all highlights
    document.querySelectorAll("#transcript p").forEach(p => {
        p.classList.remove("transcript-highlight");
    });
});

// Keyboard Challenge
const challengeCards = document.querySelectorAll(".challenge-card");
const startChallengeBtn = document.getElementById("startChallengeBtn");
const toggleMouseBtn = document.getElementById("toggleMouseBtn");
const challengeStatus = document.getElementById("challengeStatus");
const challengeMessage = document.getElementById("challengeMessage");
const successMessage = document.getElementById("successMessage");
const mouseToggleText = document.getElementById("mouseToggleText");

let visitedCards = new Set();
let challengeActive = false;

startChallengeBtn.addEventListener("click", () => {
    challengeActive = true;
    visitedCards.clear();
    challengeStatus.classList.remove("hidden");
    successMessage.classList.add("hidden");
    challengeMessage.textContent = "Tekan Tab untuk memulai navigasi. Kunjungi semua 6 kartu!";

    challengeCards.forEach((card) => {
        card.style.backgroundColor = "";
    });
    
    // Focus first card
    if (challengeCards.length > 0) {
        challengeCards[0].focus();
    }
});

toggleMouseBtn.addEventListener("click", () => {
    body.classList.toggle("no-mouse");
    const isNoMouse = body.classList.contains("no-mouse");
    mouseToggleText.textContent = isNoMouse ? "Tampilkan Kursor" : "Sembunyikan Kursor";
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
                    challengeMessage.textContent = "Sempurna! Anda berhasil menavigasi semua kartu!";
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

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
        }
    });
});

// Responsive testing function
function checkResponsiveIssues() {
    const issues = [];
    const viewportWidth = window.innerWidth;
    
    if (viewportWidth < 390) {
        issues.push('Mobile: Viewport kurang dari 390px');
    }
    
    // Check touch targets
    const buttons = document.querySelectorAll('button, a[href]');
    buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
            issues.push(`Touch target terlalu kecil: ${btn.textContent.trim() || btn.getAttribute('aria-label')}`);
        }
    });
    
    if (issues.length > 0 && window.location.hostname === 'localhost') {
        console.warn('Responsive Issues:', issues);
    }
}

// Run responsive check on load and resize
window.addEventListener('load', checkResponsiveIssues);
window.addEventListener('resize', checkResponsiveIssues);