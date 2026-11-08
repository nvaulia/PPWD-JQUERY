const typingText = "Halo, saya Novi Aulia";
const typingElement = document.getElementById("typing-title");

let typingIndex = 0;

function typeEffect() {
    if (typingIndex < typingText.length) {
        typingElement.textContent += typingText.charAt(typingIndex);
        typingIndex++;

        setTimeout(typeEffect, 110);
    }
}

typeEffect();


/* EFEK FLIP CARD */
const projectCards = document.querySelectorAll(".project-card");

projectCards.forEach((card) => {
    card.addEventListener("click", function (event) {
        if (event.target.closest(".visit-button")) {
            return;
        }

        this.classList.toggle("flipped");
    });
});


/* PENCARIAN PROYEK */
const searchInput = document.getElementById("searchInput");
const emptyMessage = document.getElementById("emptyMessage");

searchInput.addEventListener("input", function () {
    const keyword = this.value.toLowerCase().trim();
    let visibleCount = 0;

    projectCards.forEach((card) => {
        const projectName = card.querySelector(".card-front h3")
            .textContent.toLowerCase();

        const description = card.querySelector(".card-back p")
            .textContent.toLowerCase();

        const isMatch =
            projectName.includes(keyword) ||
            description.includes(keyword);

        card.style.display = isMatch ? "block" : "none";

        if (isMatch) {
            visibleCount++;
        }
    });

    emptyMessage.style.display =
        visibleCount === 0 ? "block" : "none";
});


/* MODE GELAP DAN TERANG */
const themeToggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("novi-theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "Mode terang";
}

themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");

    this.textContent = isDark ? "Mode terang" : "Mode gelap";

    localStorage.setItem(
        "novi-theme",
        isDark ? "dark" : "light"
    );
});
