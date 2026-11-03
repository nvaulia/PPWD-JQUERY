/* =========================================
   MINDCARE - COMMON.JS
   Data, helper, dan login yang dipakai bersama
   oleh halaman pasien (index.html) dan halaman admin (admin.html).
   Semua data disimpan di localStorage (prototype tanpa server).
========================================= */
(function () {
    "use strict";

    // =====================================
    // 1. KONSTANTA
    // =====================================
    const KEYS = {
        psychologists: "mindcare_v2_psychologists",
        bookings: "mindcare_v2_bookings",
        users: "mindcare_v2_users",
        session: { pasien: "mindcare_v2_session_pasien", admin: "mindcare_v2_session_admin" }
    };

    const DAY_ORDER = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
    const DAY_BY_GETDAY = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const ALL_TIMES = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "19:00"];
    const METHODS = ["Online", "Tatap Muka"];
    const PAYMENT_METHODS = ["Transfer Bank", "E-Wallet", "Virtual Account", "QRIS"];
    // Status konsultasi: Menunggu -> Dikonfirmasi -> Selesai atau Dibatalkan
    const STATUSES = ["Menunggu", "Dikonfirmasi", "Selesai", "Dibatalkan"];

    const ADMIN_ACCOUNT = { name: "Admin MindCare", email: "admin@mindcare.id", password: "admin123" };

    // =====================================
    // 2. SHA-256 (supaya password tidak disimpan polos)
    // =====================================
    function sha256(message) {
        const rotr = (x, n) => (x >>> n) | (x << (32 - n));
        const bytes = [...new TextEncoder().encode(message)];
        const bitLength = bytes.length * 8;

        bytes.push(0x80);
        while (bytes.length % 64 !== 56) bytes.push(0);
        [Math.floor(bitLength / 2 ** 32), bitLength >>> 0].forEach(part => {
            for (let shift = 24; shift >= 0; shift -= 8) bytes.push((part >>> shift) & 255);
        });

        const K = [];
        const H = [];
        for (let candidate = 2, found = 0; found < 64; candidate++) {
            let isPrime = true;
            for (let d = 2; d * d <= candidate; d++) {
                if (candidate % d === 0) { isPrime = false; break; }
            }
            if (!isPrime) continue;
            if (found < 8) H[found] = ((Math.sqrt(candidate) % 1) * 2 ** 32) >>> 0;
            K[found] = ((Math.cbrt(candidate) % 1) * 2 ** 32) >>> 0;
            found++;
        }

        for (let i = 0; i < bytes.length; i += 64) {
            const w = new Array(64);
            for (let t = 0; t < 16; t++) {
                w[t] = (bytes[i + 4 * t] << 24) | (bytes[i + 4 * t + 1] << 16) |
                       (bytes[i + 4 * t + 2] << 8) | bytes[i + 4 * t + 3];
            }
            for (let t = 16; t < 64; t++) {
                const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
                const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
                w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
            }

            let [a, b, c, d, e, f, g, h] = H;
            for (let t = 0; t < 64; t++) {
                const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
                const ch = (e & f) ^ (~e & g);
                const t1 = (h + S1 + ch + K[t] + w[t]) | 0;
                const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
                const maj = (a & b) ^ (a & c) ^ (b & c);
                const t2 = (S0 + maj) | 0;
                h = g; g = f; f = e; e = (d + t1) | 0;
                d = c; c = b; b = a; a = (t1 + t2) | 0;
            }
            [a, b, c, d, e, f, g, h].forEach((value, index) => { H[index] = (H[index] + value) | 0; });
        }

        return H.map(value => (value >>> 0).toString(16).padStart(8, "0")).join("");
    }

    function hashPassword(email, password) {
        return sha256(`mindcare:${String(email).toLowerCase()}:${password}`);
    }

    // =====================================
    // 3. STORAGE
    // =====================================
    function read(key, fallback) {
        try {
            const saved = localStorage.getItem(key);
            if (saved === null) return fallback;
            const parsed = JSON.parse(saved);
            return parsed ?? fallback;
        } catch (error) {
            console.warn("Data lokal tidak dapat dibaca:", error);
            return fallback;
        }
    }

    function write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            toast("Data gagal disimpan di browser ini.");
            return false;
        }
    }

    const defaultPsychologists = [
        {
            id: "PS001", name: "Ibnu", specialization: "Kecemasan",
            price: 150000, methods: ["Online", "Tatap Muka"],
            days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
            times: ["09:00", "10:00", "13:00", "14:00", "15:00"],
            availability: "Tersedia", photo: "images/dokter/ibnu.jpeg",
            description: "Membantu mengelola kecemasan, stres, dan keseimbangan emosi."
        },
        {
            id: "PS002", name: "Fadil", specialization: "Keluarga",
            price: 175000, methods: ["Online", "Tatap Muka"],
            days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
            times: ["09:00", "10:00", "11:00", "14:00", "15:00"],
            availability: "Tersedia", photo: "images/dokter/fadil.jpeg",
            description: "Berfokus pada hubungan keluarga, komunikasi, dan pengembangan diri."
        },
        {
            id: "PS003", name: "Seon", specialization: "Remaja",
            price: 125000, methods: ["Online"],
            days: ["Selasa", "Rabu", "Kamis", "Jumat"],
            times: ["13:00", "14:00", "15:00", "16:00"],
            availability: "Tersedia", photo: "images/dokter/seon.jpeg",
            description: "Mendampingi remaja menghadapi tantangan sekolah dan kehidupan sehari-hari."
        },
        {
            id: "PS004", name: "Dedes", specialization: "Hubungan",
            price: 200000, methods: ["Online", "Tatap Muka"],
            days: ["Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
            times: ["10:00", "11:00", "13:00", "16:00", "17:00"],
            availability: "Tersedia", photo: "images/dokter/dedes.jpeg",
            description: "Membantu memahami pola hubungan dan membangun komunikasi yang sehat."
        },
        {
            id: "PS005", name: "Novi", specialization: "Stres",
            price: 160000, methods: ["Online"],
            days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
            times: ["08:00", "09:00", "10:00", "19:00"],
            availability: "Tersedia", photo: "images/dokter/novi.jpeg",
            description: "Mendampingi pengguna dalam memahami dan mengelola stres."
        },
        {
            id: "PS006", name: "Gendis", specialization: "Pengembangan Diri",
            price: 140000, methods: ["Online", "Tatap Muka"],
            days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
            times: ["09:00", "11:00", "14:00", "16:00"],
            availability: "Tersedia", photo: "images/dokter/gendis.jpeg",
            description: "Mendukung pengenalan potensi diri, kepercayaan diri, dan tujuan hidup."
        }
    ];

    const Store = {
        psychologists: () => read(KEYS.psychologists, defaultPsychologists),
        savePsychologists: list => write(KEYS.psychologists, list),
        bookings: () => read(KEYS.bookings, []),
        saveBookings: list => write(KEYS.bookings, list),
        users: () => read(KEYS.users, []),
        saveUsers: list => write(KEYS.users, list)
    };

    function seed() {
        if (localStorage.getItem(KEYS.psychologists) === null) {
            Store.savePsychologists(defaultPsychologists);
        }
        if (localStorage.getItem(KEYS.bookings) === null) {
            Store.saveBookings([]);
        }

        const users = Store.users();
        if (!users.some(user => user.role === "admin")) {
            users.push({
                id: "US-ADMIN",
                name: ADMIN_ACCOUNT.name,
                email: ADMIN_ACCOUNT.email,
                role: "admin",
                passwordHash: hashPassword(ADMIN_ACCOUNT.email, ADMIN_ACCOUNT.password)
            });
            Store.saveUsers(users);
        }
    }

    // =====================================
    // 4. LOGIN
    // =====================================
    const Auth = {
        current(role) {
            const sessionId = read(KEYS.session[role], null);
            if (!sessionId) return null;
            const user = Store.users().find(item => item.id === sessionId && item.role === role);
            return user || null;
        },

        register({ name, email, password }) {
            const cleanName = String(name || "").trim();
            const cleanEmail = String(email || "").trim().toLowerCase();

            if (cleanName.length < 2) return { ok: false, error: "Nama minimal 2 karakter." };
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
                return { ok: false, error: "Format email belum benar." };
            }
            if (String(password || "").length < 6) {
                return { ok: false, error: "Password minimal 6 karakter." };
            }

            const users = Store.users();
            if (users.some(user => user.email === cleanEmail)) {
                return { ok: false, error: "Email sudah terdaftar. Silakan masuk." };
            }

            const user = {
                id: generateId("US"),
                name: cleanName,
                email: cleanEmail,
                role: "pasien",
                passwordHash: hashPassword(cleanEmail, password)
            };
            users.push(user);
            Store.saveUsers(users);
            write(KEYS.session.pasien, user.id);
            return { ok: true, user };
        },

        login(email, password, role) {
            const cleanEmail = String(email || "").trim().toLowerCase();
            const user = Store.users().find(item => item.email === cleanEmail);

            if (!user || user.passwordHash !== hashPassword(cleanEmail, password)) {
                return { ok: false, error: "Email atau password salah." };
            }
            if (user.role !== role) {
                return {
                    ok: false,
                    error: role === "admin"
                        ? "Akun ini bukan akun admin. Pasien masuk lewat halaman utama."
                        : "Akun admin masuk lewat halaman admin."
                };
            }

            write(KEYS.session[role], user.id);
            return { ok: true, user };
        },

        logout(role) {
            try { localStorage.removeItem(KEYS.session[role]); } catch (error) { /* abaikan */ }
        }
    };

    // =====================================
    // 5. HELPER
    // =====================================
    const $ = (selector, parent = document) => parent.querySelector(selector);
    const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

    function esc(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
        })[character]);
    }

    function rupiah(value) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency", currency: "IDR", maximumFractionDigits: 0
        }).format(Number(value) || 0);
    }

    function generateId(prefix) {
        return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    }

    function bookingNumber() {
        const existing = new Set(Store.bookings().map(item => item.id));
        const now = new Date();
        const stamp = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
        let id;
        do {
            id = `BK-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        } while (existing.has(id));
        return id;
    }

    function todayString() {
        const now = new Date();
        return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    }

    function dayName(dateString) {
        const date = new Date(`${dateString}T00:00:00`);
        return Number.isNaN(date.getTime()) ? "" : DAY_BY_GETDAY[date.getDay()];
    }

    function formatDate(dateString) {
        if (!dateString) return "-";
        const date = new Date(`${dateString}T00:00:00`);
        if (Number.isNaN(date.getTime())) return dateString;
        return new Intl.DateTimeFormat("id-ID", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
        }).format(date);
    }

    function formatTime(time) {
        return String(time || "").replace(":", ".");
    }

    // "Senin, Selasa, Rabu, Kamis" -> "Senin – Kamis"
    function formatDays(days) {
        const sorted = DAY_ORDER.filter(day => (days || []).includes(day));
        if (sorted.length === 0) return "";

        const groups = [];
        sorted.forEach(day => {
            const index = DAY_ORDER.indexOf(day);
            const last = groups[groups.length - 1];
            if (last && DAY_ORDER.indexOf(last[last.length - 1]) === index - 1) {
                last.push(day);
            } else {
                groups.push([day]);
            }
        });

        return groups.map(group =>
            group.length >= 3 ? `${group[0]} – ${group[group.length - 1]}` : group.join(", ")
        ).join(", ");
    }

    function getPsychologist(id) {
        return Store.psychologists().find(item => item.id === id);
    }

    // Slot yang sudah dipakai booking lain (booking dibatalkan tidak dihitung)
    function takenSlots(psychologistId, date, ignoreBookingId) {
        return Store.bookings()
            .filter(item =>
                item.psychologistId === psychologistId &&
                item.date === date &&
                item.status !== "Dibatalkan" &&
                item.id !== ignoreBookingId)
            .map(item => item.time);
    }

    // Hasil: { ok, slots, message }
    function getAvailableSlots(psychologist, date) {
        if (!psychologist) return { ok: false, slots: [], message: "Data psikolog tidak ditemukan." };
        if (psychologist.availability !== "Tersedia") {
            return { ok: false, slots: [], message: "Psikolog ini sedang tidak tersedia." };
        }
        if (!date) return { ok: false, slots: [], message: "Pilih tanggal untuk melihat jam yang tersedia." };

        const name = dayName(date);
        if (!(psychologist.days || []).includes(name)) {
            return {
                ok: false, slots: [],
                message: `Tidak ada praktik di hari ${name}. Jadwal praktik: ${formatDays(psychologist.days)}.`
            };
        }

        const taken = takenSlots(psychologist.id, date);
        let slots = (psychologist.times || []).filter(time => !taken.includes(time));

        if (date === todayString()) {
            const now = new Date();
            const nowText = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
            slots = slots.filter(time => time > nowText);
        }

        if (slots.length === 0) {
            return { ok: false, slots: [], message: "Semua jam pada tanggal ini sudah penuh. Coba tanggal lain." };
        }
        return { ok: true, slots, message: "" };
    }

    function statusClass(value) {
        const text = String(value || "").toLowerCase();
        if (text.includes("lunas") || text.includes("selesai") || text.includes("dikonfirmasi")) return "ok";
        if (text.includes("batal")) return "bad";
        return "wait";
    }

    // Avatar ilustrasi (dipakai kalau psikolog belum punya foto)
    const AVATAR_TONES = ["green", "blue", "pink", "orange"];

    function initialsOf(name) {
        return String(name || "P").replace(/^(Dr\.?\s*)/i, "").split(/[\s,]+/)
            .filter(Boolean).slice(0, 2).map(word => word[0]).join("").toUpperCase();
    }

    function avatarHTML(item, extraClass = "") {
        const tone = AVATAR_TONES[Math.abs([...String(item.id)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)) % AVATAR_TONES.length];
        const inner = item.photo
            ? `<img src="${esc(item.photo)}" alt="Foto ${esc(item.name)}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'avatar-initials',textContent:'${esc(initialsOf(item.name))}'}))">`
            : `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="36" r="19" class="av-fill"/><path d="M16 100C16 70 29 60 50 60s34 10 34 40Z" class="av-fill"/></svg>`;
        return `<div class="avatar tone-${tone} ${extraClass}" role="img" aria-label="Foto ${esc(item.name)}">${inner}</div>`;
    }

    // =====================================
    // 6. TOAST DAN MODAL
    // =====================================
    function toast(message) {
        const element = $("#toast");
        if (!element) { console.log(message); return; }

        element.textContent = message;
        element.hidden = false;
        clearTimeout(toast.timer);
        toast.timer = setTimeout(() => { element.hidden = true; }, 3200);
    }

    function openModal(modal) {
        if (!modal) return;
        modal.hidden = false;
        document.body.classList.add("no-scroll");
        const target = $("[data-autofocus], input:not([type=hidden]):not([readonly]), select, textarea, button.btn", modal);
        if (target) setTimeout(() => target.focus(), 60);
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.hidden = true;
        if (!$(".modal:not([hidden])")) document.body.classList.remove("no-scroll");
    }

    function bindModals() {
        $$(".modal").forEach(modal => {
            $$("[data-close-modal]", modal).forEach(item => {
                item.addEventListener("click", () => closeModal(modal));
            });
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape") $$(".modal:not([hidden])").forEach(closeModal);
        });
    }

    seed();

    window.PC = {
        KEYS, DAY_ORDER, ALL_TIMES, METHODS, PAYMENT_METHODS, STATUSES, ADMIN_ACCOUNT,
        Store, Auth, sha256,
        $, $$, esc, rupiah, generateId, bookingNumber, todayString, dayName,
        formatDate, formatTime, formatDays, getPsychologist, takenSlots, getAvailableSlots,
        statusClass, avatarHTML, initialsOf, toast, openModal, closeModal, bindModals
    };
})();
