// High Contrast Mode
const contrastToggle = document.getElementById("contrastToggle");
const contrastToggleMobile = document.getElementById("contrastToggleMobile");
const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const body = document.body;

// Audio Player dengan Sliding Highlight Effect
const audio = new Audio("assets/audio/id.mp3");
let isPlaying = false;
let currentHighlightIndex = -1;
let previousHighlightIndex = -1;

// Timing data untuk setiap paragraf [start, end] dalam detik
const transcriptTiming = [
    [0, 9],
    [9, 26],
    [26, 40],
    [40, 55]
];

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

if (contrastToggle) contrastToggle.addEventListener("click", toggleHighContrast);
if (contrastToggleMobile) contrastToggleMobile.addEventListener("click", toggleHighContrast);

// Mobile Menu
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
        const isExpanded = mobileMenu.style.maxHeight !== "0px" && mobileMenu.style.maxHeight !== "";
        mobileMenu.style.maxHeight = isExpanded ? "0px" : mobileMenu.scrollHeight + "px";
        mobileMenuToggle.setAttribute("aria-expanded", !isExpanded);

        // Update icon
        const icon = mobileMenuToggle.querySelector("i");
        icon.className = isExpanded ? "fas fa-bars text-2xl" : "fas fa-times text-2xl";
    });
}

if (mobileMenu) {
    const mobileLinks = mobileMenu.querySelectorAll("a");
    mobileLinks.forEach((link) => {
        link.addEventListener("click", () => {
            mobileMenu.style.maxHeight = "0px";
            mobileMenuToggle.setAttribute("aria-expanded", "false");
            const icon = mobileMenuToggle.querySelector("i");
            icon.className = "fas fa-bars text-2xl";
        });
    });
}

// Audio Functions dengan Sliding Highlight Effect
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

audio.addEventListener("loadedmetadata", () => {
    const totalTimeEl = document.getElementById("totalTime");
    if (totalTimeEl) {
        totalTimeEl.textContent = formatTime(audio.duration);
    }
});

audio.addEventListener("timeupdate", () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    const audioProgressEl = document.getElementById("audioProgress");
    const currentTimeEl = document.getElementById("currentTime");

    if (audioProgressEl) {
        audioProgressEl.style.width = progress + "%";
    }
    if (currentTimeEl) {
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }

    // Highlight current transcript paragraph dengan efek sliding
    highlightTranscriptWithSlide(audio.currentTime);
});

function highlightTranscriptWithSlide(currentTime) {
    const paragraphs = document.querySelectorAll("#transcript p");
    if (paragraphs.length === 0) return;

    let newHighlightIndex = -1;

    // Cari paragraf yang seharusnya aktif
    paragraphs.forEach((para, index) => {
        const [startTime, endTime] = transcriptTiming[index] || [index * 7, (index + 1) * 7];

        if (currentTime >= startTime && currentTime < endTime) {
            newHighlightIndex = index;
        }
    });

    // Jika tidak ada perubahan, return
    if (newHighlightIndex === currentHighlightIndex) return;

    // Reset semua highlights
    paragraphs.forEach((para, index) => {
        para.classList.remove(
            "transcript-highlight",
            "transcript-highlight-previous",
            "transcript-highlight-next"
        );
    });

    // Apply efek bergeser berdasarkan arah
    if (newHighlightIndex !== -1) {
        const currentPara = paragraphs[newHighlightIndex];

        // Highlight current paragraph
        currentPara.classList.add("transcript-highlight");

        // Previous paragraph effect (fade out)
        if (currentHighlightIndex !== -1 && currentHighlightIndex < paragraphs.length) {
            paragraphs[currentHighlightIndex].classList.add("transcript-highlight-previous");
        }

        // Next paragraph anticipation (jika bergerak maju)
        if (newHighlightIndex > currentHighlightIndex && newHighlightIndex + 1 < paragraphs.length) {
            paragraphs[newHighlightIndex + 1].classList.add("transcript-highlight-next");
        }

        // Auto scroll ke paragraf aktif
        autoScrollToParagraph(currentPara, newHighlightIndex);
    }

    // Update state
    previousHighlightIndex = currentHighlightIndex;
    currentHighlightIndex = newHighlightIndex;
}

function autoScrollToParagraph(para, index) {
    const transcriptContainer = document.getElementById("transcript");
    if (!transcriptContainer) return;

    const containerRect = transcriptContainer.getBoundingClientRect();
    const paraRect = para.getBoundingClientRect();

    // Cek apakah paragraf fully visible
    const isFullyVisible = (
        paraRect.top >= containerRect.top &&
        paraRect.bottom <= containerRect.bottom
    );

    // Scroll hanya jika tidak fully visible
    if (!isFullyVisible) {
        const scrollOptions = {
            behavior: "smooth",
            block: "center"
        };

        // Untuk paragraf pertama, scroll ke top
        if (index === 0) {
            scrollOptions.block = "start";
        }

        para.scrollIntoView(scrollOptions);
    }
}

audio.addEventListener("ended", () => {
    isPlaying = false;
    updatePlayButton(false);
    const audioStatus = document.getElementById("audioStatus");
    if (audioStatus) audioStatus.textContent = "Selesai diputar";
    audio.currentTime = 0;

    // Reset semua highlights dengan efek fade out
    const paragraphs = document.querySelectorAll("#transcript p");
    paragraphs.forEach((para, index) => {
        if (para.classList.contains("transcript-highlight")) {
            para.classList.add("transcript-highlight-previous");
            setTimeout(() => {
                para.classList.remove(
                    "transcript-highlight",
                    "transcript-highlight-previous",
                    "transcript-highlight-next"
                );
            }, 800);
        } else {
            para.classList.remove(
                "transcript-highlight",
                "transcript-highlight-previous",
                "transcript-highlight-next"
            );
        }
    });

    currentHighlightIndex = -1;
    previousHighlightIndex = -1;
});

audio.addEventListener("error", () => {
    const audioStatus = document.getElementById("audioStatus");
    if (audioStatus) audioStatus.textContent = "Error: File audio tidak ditemukan";
    console.error("Audio file not found at assets/audio/id.mp3");
});

function playScreenReaderSimulation() {
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        updatePlayButton(false);
        const audioStatus = document.getElementById("audioStatus");
        if (audioStatus) audioStatus.textContent = "Dijeda";
        return;
    }

    audio.play().then(() => {
        isPlaying = true;
        updatePlayButton(true);
        const audioStatus = document.getElementById("audioStatus");
        if (audioStatus) audioStatus.textContent = "Sedang diputar...";
    }).catch((err) => {
        console.error("Error playing audio:", err);
        const audioStatus = document.getElementById("audioStatus");
        if (audioStatus) audioStatus.textContent = "Gagal memutar audio";
    });
}

function updatePlayButton(playing) {
    const playPauseBtn = document.getElementById("playPauseBtn");
    if (!playPauseBtn) return;

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
const playPauseBtn = document.getElementById("playPauseBtn");
if (playPauseBtn) {
    playPauseBtn.addEventListener("click", playScreenReaderSimulation);
}

const heroScreenReaderBtn = document.getElementById("heroScreenReaderBtn");
if (heroScreenReaderBtn) {
    heroScreenReaderBtn.addEventListener("click", () => {
        const simulasiSection = document.getElementById("simulasi");
        if (simulasiSection) {
            simulasiSection.scrollIntoView({ behavior: "smooth" });
            setTimeout(playScreenReaderSimulation, 500);
        }
    });
}

const stopBtn = document.getElementById("stopBtn");
if (stopBtn) {
    stopBtn.addEventListener("click", () => {
        audio.pause();
        audio.currentTime = 0;
        isPlaying = false;
        updatePlayButton(false);

        const audioStatus = document.getElementById("audioStatus");
        if (audioStatus) audioStatus.textContent = "Dihentikan";

        const audioProgress = document.getElementById("audioProgress");
        if (audioProgress) audioProgress.style.width = "0%";

        const currentTime = document.getElementById("currentTime");
        if (currentTime) currentTime.textContent = "0:00";

        // Remove all highlights
        const paragraphs = document.querySelectorAll("#transcript p");
        paragraphs.forEach((para, index) => {
            para.classList.remove(
                "transcript-highlight",
                "transcript-highlight-previous",
                "transcript-highlight-next"
            );
        });

        currentHighlightIndex = -1;
        previousHighlightIndex = -1;
    });
}

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

if (startChallengeBtn) {
    startChallengeBtn.addEventListener("click", () => {
        challengeActive = true;
        visitedCards.clear();
        if (challengeStatus) challengeStatus.classList.remove("hidden");
        if (successMessage) successMessage.classList.add("hidden");
        if (challengeMessage) challengeMessage.textContent = "Tekan Tab untuk memulai navigasi. Kunjungi semua 6 kartu!";

        challengeCards.forEach((card) => {
            card.style.backgroundColor = "";
        });

        // Focus first card
        if (challengeCards.length > 0) {
            challengeCards[0].focus();
        }
    });
}

if (toggleMouseBtn) {
    toggleMouseBtn.addEventListener("click", () => {
        body.classList.toggle("no-mouse");
        const isNoMouse = body.classList.contains("no-mouse");
        if (mouseToggleText) {
            mouseToggleText.textContent = isNoMouse ? "Tampilkan Kursor" : "Sembunyikan Kursor";
        }
    });
}

challengeCards.forEach((card) => {
    card.addEventListener("focus", () => {
        if (challengeActive) {
            const cardNum = card.getAttribute("data-card");
            if (!visitedCards.has(cardNum)) {
                visitedCards.add(cardNum);
                card.style.backgroundColor = "#d1fae5";

                if (challengeMessage) challengeMessage.textContent = `Kartu ${visitedCards.size} dari 6 dikunjungi. Terus navigasi dengan Tab!`;

                if (visitedCards.size === 6) {
                    if (successMessage) successMessage.classList.remove("hidden");
                    if (challengeMessage) challengeMessage.textContent = "Sempurna! Anda berhasil menavigasi semua kartu!";
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