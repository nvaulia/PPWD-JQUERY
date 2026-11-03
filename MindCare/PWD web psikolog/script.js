/* =========================================
   MINDCARE - SCRIPT.JS (halaman pasien)
   UC-01 Melihat Psikolog      UC-02 Booking Konsultasi
   UC-03 Pembayaran Konsultasi UC-04 Melihat Booking
   Data & login ada di common.js
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const {
        $, $$, esc, rupiah, Store, Auth, formatDate, formatTime, formatDays,
        getPsychologist, getAvailableSlots, bookingNumber, todayString,
        statusClass, avatarHTML, toast, openModal, closeModal
    } = window.PC;

    // State sementara selama proses booking & pembayaran
    let draft = null;            // { psychologistId, method, date, time, phone }
    let lastBookingId = null;    // booking yang baru dibuat
    let activePaymentId = null;  // booking yang sedang dibayar
    let afterLogin = null;       // aksi yang dilanjutkan setelah login

    const currentUser = () => Auth.current("pasien");

    // =====================================
    // 1. NAVBAR DAN HEADER
    // =====================================
    const menuToggle = $("#menuToggle");
    const navbar = $("#navbar");
    const authArea = $("#authArea");

    menuToggle?.addEventListener("click", () => {
        const isOpen = navbar.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    $$("#navbar a").forEach(link => {
        link.addEventListener("click", () => {
            navbar.classList.remove("open");
            menuToggle?.setAttribute("aria-expanded", "false");
        });
    });

    function renderAuthArea() {
        const user = currentUser();

        authArea.innerHTML = user
            ? `<span class="user-chip" title="${esc(user.email)}">Hai, ${esc(user.name.split(" ")[0])}</span>
               <button class="btn btn-white btn-sm" type="button" data-logout>Keluar</button>`
            : `<button class="btn btn-pink btn-sm" type="button" data-open-login>Masuk / Daftar</button>`;
    }

    authArea.addEventListener("click", event => {
        if (event.target.closest("[data-logout]")) {
            Auth.logout("pasien");
            draft = null;
            renderAuthArea();
            renderHistory();
            toast("Kamu sudah keluar dari akun.");
        }
    });

    document.addEventListener("click", event => {
        if (event.target.closest("[data-open-login]")) {
            afterLogin = null;
            navbar.classList.remove("open");
            openAuth("Masuk dulu untuk membuat booking dan melihat booking milikmu.");
        }
    });

    // =====================================
    // 2. BANNER PROMOSI
    // =====================================
    const slides = $$(".banner-slide");
    const dotsBox = $("#bannerDots");
    let slideIndex = 0;
    let slideTimer = null;

    function showSlide(index, animate = true) {
        slideIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => {
            slide.hidden = i !== slideIndex;
            slide.classList.toggle("is-active", i === slideIndex);
            slide.classList.remove("enter");
        });
        if (animate) {
            const active = slides[slideIndex];
            void active.offsetWidth;
            active.classList.add("enter");
        }
        $$("button", dotsBox).forEach((dot, i) => {
            dot.setAttribute("aria-selected", String(i === slideIndex));
        });
    }

    function startSlides() {
        stopSlides();
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        slideTimer = setInterval(() => showSlide(slideIndex + 1), 6000);
    }

    function stopSlides() {
        clearInterval(slideTimer);
    }

    if (slides.length) {
        dotsBox.innerHTML = slides.map((_, i) =>
            `<button type="button" role="tab" aria-label="Banner ${i + 1}" data-slide="${i}"></button>`
        ).join("");

        dotsBox.addEventListener("click", event => {
            const dot = event.target.closest("[data-slide]");
            if (dot) showSlide(Number(dot.dataset.slide));
        });
        $("#bannerPrev").addEventListener("click", () => showSlide(slideIndex - 1));
        $("#bannerNext").addEventListener("click", () => showSlide(slideIndex + 1));

        const banner = $("#banner");
        banner.addEventListener("mouseenter", stopSlides);
        banner.addEventListener("mouseleave", startSlides);
        banner.addEventListener("focusin", stopSlides);
        banner.addEventListener("focusout", startSlides);

        showSlide(0, false);
        startSlides();
    }

    // =====================================
    // 3. KATALOG PSIKOLOG (UC-01)
    // =====================================
    const psychologistList = $("#psychologistList");
    const searchInput = $("#searchPsychologist");
    const specializationFilter = $("#specializationFilter");
    const psychologistCount = $("#psychologistCount");
    const emptyMessage = $("#emptyMessage");

    function hasSchedule(item) {
        return (item.days || []).length > 0 && (item.times || []).length > 0;
    }

    function isBookable(item) {
        return item.availability === "Tersedia" && hasSchedule(item);
    }

    function populateSpecializationFilter() {
        const selected = specializationFilter.value;
        const list = [...new Set(Store.psychologists().map(item => item.specialization).filter(Boolean))]
            .sort((a, b) => a.localeCompare(b, "id"));

        specializationFilter.innerHTML =
            '<option value="">Semua spesialisasi</option>' +
            list.map(item => `<option value="${esc(item)}">${esc(item)}</option>`).join("");

        if (list.includes(selected)) specializationFilter.value = selected;
    }

    function scheduleHTML(item) {
        if (!hasSchedule(item)) {
            return '<p class="note-off">Jadwal praktik belum tersedia.</p>';
        }

        const shown = item.times.slice(0, 5);
        const rest = item.times.length - shown.length;

        return `
            <p class="schedule-days">${esc(formatDays(item.days))}</p>
            <ul class="chip-list">
                ${shown.map(time => `<li>${esc(formatTime(time))}</li>`).join("")}
                ${rest > 0 ? `<li>+${rest}</li>` : ""}
            </ul>`;
    }

    function renderPsychologists() {
        const all = Store.psychologists();
        const keyword = searchInput.value.trim().toLowerCase();
        const selected = specializationFilter.value;

        const filtered = all.filter(item => {
            const matchesKeyword =
                item.name.toLowerCase().includes(keyword) ||
                item.specialization.toLowerCase().includes(keyword);
            return matchesKeyword && (!selected || item.specialization === selected);
        });

        psychologistCount.textContent = all.length === 0
            ? "Belum ada psikolog"
            : `${filtered.length} psikolog ditemukan`;

        psychologistList.innerHTML = filtered.map(item => {
            const bookable = isBookable(item);
            const available = item.availability === "Tersedia";
            const methods = Array.isArray(item.methods) ? item.methods : [];

            let note = "";
            if (!available) note = '<p class="note-off">Psikolog ini sedang tidak tersedia.</p>';

            return `
                <article class="psy-card stack ${bookable ? "" : "is-off"}">
                    <div class="psy-top">
                        ${avatarHTML(item)}
                        <span class="badge ${available ? "badge-ok" : "badge-bad"}">${esc(item.availability)}</span>
                    </div>

                    <h3>${esc(item.name)}</h3>
                    <p class="pill pill-flat pill-xs">${esc(item.specialization)}</p>
                    <p class="psy-desc">${esc(item.description || "Layanan konsultasi psikologi sesuai kebutuhanmu.")}</p>

                    <dl class="facts">
                        <div>
                            <dt>Metode</dt>
                            <dd>${methods.length
                                ? methods.map(method => `<span class="tag">${esc(method)}</span>`).join("")
                                : "-"}</dd>
                        </div>
                        <div>
                            <dt>Jadwal praktik</dt>
                            <dd>${scheduleHTML(item)}</dd>
                        </div>
                    </dl>
                    ${note}

                    <div class="psy-bottom">
                        <p class="price"><small>Biaya konsultasi</small><strong>${rupiah(item.price)}</strong></p>
                        <button class="btn btn-pink btn-sm" type="button"
                                data-book="${esc(item.id)}" ${bookable ? "" : "disabled"}>
                            ${bookable ? "Booking" : "Tidak tersedia"}
                        </button>
                    </div>
                </article>`;
        }).join("");

        if (filtered.length === 0) {
            emptyMessage.textContent = all.length === 0
                ? "Belum ada psikolog yang terdaftar. Silakan cek lagi nanti."
                : "Psikolog tidak ditemukan. Coba nama atau spesialisasi lain.";
        }
        emptyMessage.hidden = filtered.length !== 0;
    }

    searchInput.addEventListener("input", renderPsychologists);
    specializationFilter.addEventListener("change", renderPsychologists);

    // =====================================
    // 4. LOGIN DAN DAFTAR PASIEN
    // =====================================
    const authModal = $("#authModal");
    const loginForm = $("#loginForm");
    const registerForm = $("#registerForm");

    function setAuthTab(tab) {
        const isLogin = tab === "login";
        loginForm.hidden = !isLogin;
        registerForm.hidden = isLogin;
        $("#tabLogin").setAttribute("aria-selected", String(isLogin));
        $("#tabRegister").setAttribute("aria-selected", String(!isLogin));
        $("#authTitle").textContent = isLogin ? "Masuk ke akunmu" : "Buat akun pasien";
        $$(".form-error", authModal).forEach(item => { item.hidden = true; });
    }

    function openAuth(hint, tab = "login") {
        $("#authHint").textContent = hint || "";
        setAuthTab(tab);
        openModal(authModal);
    }

    $$("[data-auth-tab]").forEach(button => {
        button.addEventListener("click", () => setAuthTab(button.dataset.authTab));
    });

    function showError(element, message) {
        element.textContent = message;
        element.hidden = !message;
    }

    function finishLogin(user) {
        closeModal(authModal);
        renderAuthArea();
        renderHistory();
        toast(`Selamat datang, ${user.name.split(" ")[0]}!`);

        const next = afterLogin;
        afterLogin = null;
        if (next) next();
    }

    loginForm.addEventListener("submit", event => {
        event.preventDefault();
        const result = Auth.login($("#loginEmail").value, $("#loginPassword").value, "pasien");

        if (!result.ok) {
            showError($("#loginError"), result.error);
            return;
        }
        loginForm.reset();
        finishLogin(result.user);
    });

    registerForm.addEventListener("submit", event => {
        event.preventDefault();
        const result = Auth.register({
            name: $("#registerName").value,
            email: $("#registerEmail").value,
            password: $("#registerPassword").value
        });

        if (!result.ok) {
            showError($("#registerError"), result.error);
            return;
        }
        registerForm.reset();
        finishLogin(result.user);
    });

    // =====================================
    // 5. BOOKING KONSULTASI (UC-02)
    // =====================================
    const bookingModal = $("#bookingModal");
    const bookStep1 = $("#bookStep1");
    const bookStep2 = $("#bookStep2");
    const bookStep3 = $("#bookStep3");
    const dateInput = $("#consultationDate");

    const choiceHTML = (name, value, label, checked) => `
        <label class="choice">
            <input type="radio" name="${name}" value="${esc(value)}" ${checked ? "checked" : ""}>
            <span>${esc(label)}</span>
        </label>`;

    function summaryHTML(rows, total) {
        return `
            <dl class="summary-list">
                ${rows.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${value}</dd></div>`).join("")}
                ${total !== undefined
                    ? `<div class="summary-total"><dt>Total biaya</dt><dd>${rupiah(total)}</dd></div>`
                    : ""}
            </dl>`;
    }

    function showBookingStep(step) {
        bookStep1.hidden = step !== 1;
        bookStep2.hidden = step !== 2;
        bookStep3.hidden = step !== 3;

        $$("#bookingSteps li").forEach((item, index) => {
            item.classList.toggle("is-current", index + 1 === step);
            item.classList.toggle("is-done", index + 1 < step);
        });
        $("#bookingModal .modal-card").scrollTop = 0;
    }

    function renderSlots() {
        const psychologist = getPsychologist(draft.psychologistId);
        const result = getAvailableSlots(psychologist, draft.date);

        if (!draft.date) {
            $("#slotHint").textContent = psychologist
                ? `Praktik hari ${formatDays(psychologist.days)}. Pilih tanggal untuk melihat jam yang kosong.`
                : "";
        } else {
            $("#slotHint").textContent = result.ok
                ? `${result.slots.length} jam tersedia pada ${formatDate(draft.date)}.`
                : result.message;
        }

        if (!result.slots.includes(draft.time)) draft.time = "";

        $("#slotChoices").innerHTML = result.slots.map(time =>
            choiceHTML("slot", time, formatTime(time), time === draft.time)
        ).join("");
    }

    function startBooking(psychologistId) {
        const psychologist = getPsychologist(psychologistId);

        if (!psychologist) {
            toast("Data psikolog tidak ditemukan.");
            return;
        }
        if (psychologist.availability !== "Tersedia") {
            toast("Psikolog ini sedang tidak tersedia.");
            return;
        }
        if (!hasSchedule(psychologist)) {
            toast("Jadwal praktik psikolog ini belum tersedia.");
            return;
        }

        const methods = psychologist.methods || [];
        draft = {
            psychologistId: psychologist.id,
            method: methods.length === 1 ? methods[0] : "",
            date: "",
            time: "",
            phone: draft?.phone || ""
        };

        $("#bookPsychologist").innerHTML = `
            ${avatarHTML(psychologist, "avatar-sm")}
            <div>
                <strong>${esc(psychologist.name)}</strong>
                <span>${esc(psychologist.specialization)} · ${rupiah(psychologist.price)}</span>
            </div>`;

        $("#methodChoices").innerHTML = methods.map(method =>
            choiceHTML("method", method, method, method === draft.method)
        ).join("");

        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 60);
        dateInput.min = todayString();
        dateInput.max = new Date(maxDate.getTime() - maxDate.getTimezoneOffset() * 60000)
            .toISOString().split("T")[0];
        dateInput.value = "";

        showError($("#step1Error"), "");
        showError($("#step2Error"), "");
        renderSlots();
        showBookingStep(1);
        openModal(bookingModal);
    }

    psychologistList.addEventListener("click", event => {
        const button = event.target.closest("[data-book]");
        if (button) startBooking(button.dataset.book);
    });

    $("#methodChoices").addEventListener("change", event => {
        draft.method = event.target.value;
    });

    $("#slotChoices").addEventListener("change", event => {
        draft.time = event.target.value;
    });

    dateInput.addEventListener("change", () => {
        draft.date = dateInput.value;
        draft.time = "";
        showError($("#step1Error"), "");
        renderSlots();
    });

    // Cek ulang pilihan jadwal: psikolog, jadwal, dan metode harus dipilih dan masih tersedia
    function validateSelection() {
        const psychologist = getPsychologist(draft?.psychologistId);

        if (!psychologist || psychologist.availability !== "Tersedia") {
            return "Psikolog ini sedang tidak tersedia. Pilih psikolog lain.";
        }
        if (!draft.method) return "Pilih metode konsultasi.";
        if (!(psychologist.methods || []).includes(draft.method)) {
            return "Metode konsultasi ini tidak tersedia untuk psikolog tersebut.";
        }
        if (!draft.date) return "Pilih tanggal konsultasi.";
        if (!draft.time) return "Pilih jam konsultasi.";
        if (!getAvailableSlots(psychologist, draft.date).slots.includes(draft.time)) {
            return "Jadwal yang kamu pilih sudah tidak tersedia. Pilih jam lain.";
        }
        return "";
    }

    function renderBookingSummary() {
        const psychologist = getPsychologist(draft.psychologistId);

        $("#bookSummary").innerHTML = summaryHTML([
            ["Psikolog", esc(psychologist.name)],
            ["Spesialisasi", esc(psychologist.specialization)],
            ["Jadwal", `${esc(formatDate(draft.date))}, ${esc(formatTime(draft.time))}`],
            ["Metode", esc(draft.method)]
        ], psychologist.price);
    }

    function goToStep2() {
        const user = currentUser();
        if (!user) return;

        $("#customerName").value = $("#customerName").value || user.name;
        $("#customerEmail").value = user.email;
        $("#customerPhone").value = draft.phone || "";
        showError($("#step2Error"), "");
        renderBookingSummary();
        showBookingStep(2);
    }

    $("#toStep2").addEventListener("click", () => {
        const message = validateSelection();
        showError($("#step1Error"), message);
        if (message) {
            renderSlots();
            return;
        }

        // Pasien harus login sebelum membuat booking
        if (!currentUser()) {
            afterLogin = () => {
                openModal(bookingModal);
                goToStep2();
            };
            closeModal(bookingModal);
            openAuth("Masuk dulu untuk melanjutkan booking. Pilihan jadwalmu tetap tersimpan.");
            return;
        }

        goToStep2();
    });

    $("#backToStep1").addEventListener("click", () => {
        draft.phone = $("#customerPhone").value.trim();
        renderSlots();
        showBookingStep(1);
    });

    bookStep2.addEventListener("submit", event => {
        event.preventDefault();
        showError($("#step2Error"), "");

        const user = currentUser();
        if (!user) {
            showError($("#step2Error"), "Sesi login berakhir. Masuk lagi untuk melanjutkan.");
            return;
        }

        const selectionError = validateSelection();
        if (selectionError) {
            closeModalToStep1(selectionError);
            return;
        }

        const customerName = $("#customerName").value.trim();
        const phone = $("#customerPhone").value.replace(/[\s-]/g, "");
        const notes = $("#bookingNotes").value.trim();

        if (customerName.length < 2) {
            showError($("#step2Error"), "Nama lengkap wajib diisi.");
            return;
        }
        if (!/^\+?\d{9,15}$/.test(phone)) {
            showError($("#step2Error"), "Nomor WhatsApp / HP belum benar. Gunakan angka saja, 9 sampai 15 digit.");
            return;
        }

        const psychologist = getPsychologist(draft.psychologistId);
        const booking = {
            id: bookingNumber(),
            userId: user.id,
            psychologistId: psychologist.id,
            psychologistName: psychologist.name,
            specialization: psychologist.specialization,
            patientName: customerName,
            phone,
            email: user.email,
            date: draft.date,
            time: draft.time,
            method: draft.method,
            notes,
            price: Number(psychologist.price),
            paymentMethod: "",
            paymentStatus: "Belum Dibayar",
            status: "Menunggu",
            createdAt: new Date().toISOString()
        };

        const bookings = Store.bookings();
        bookings.unshift(booking);
        if (!Store.saveBookings(bookings)) return;

        lastBookingId = booking.id;
        draft.phone = phone;
        $("#bookingNotes").value = "";

        $("#bookResult").innerHTML = bookingInfoHTML(booking);
        showBookingStep(3);
        renderHistory();
        toast("Booking berhasil dibuat.");
    });

    function closeModalToStep1(message) {
        renderSlots();
        showBookingStep(1);
        showError($("#step1Error"), message);
    }

    function bookingInfoHTML(booking) {
        return summaryHTML([
            ["Nomor booking", `<strong>${esc(booking.id)}</strong>`],
            ["Psikolog", esc(booking.psychologistName)],
            ["Jadwal", `${esc(formatDate(booking.date))}, ${esc(formatTime(booking.time))}`],
            ["Metode", esc(booking.method)],
            ["Status pembayaran", `<span class="badge badge-${statusClass(booking.paymentStatus)}">${esc(booking.paymentStatus)}</span>`],
            ["Status konsultasi", `<span class="badge badge-${statusClass(booking.status)}">${esc(booking.status)}</span>`]
        ], booking.price);
    }

    $("#payNow").addEventListener("click", () => {
        closeModal(bookingModal);
        openPayment(lastBookingId);
    });

    $("#payLater").addEventListener("click", () => {
        closeModal(bookingModal);
        $("#booking-saya").scrollIntoView({ behavior: "smooth" });
    });

    // =====================================
    // 6. PEMBAYARAN (UC-03)
    // =====================================
    const paymentModal = $("#paymentModal");
    const paymentForm = $("#paymentForm");
    const paymentSummary = $("#paymentSummary");

    function paymentSummaryHTML(booking) {
        return summaryHTML([
            ["Nomor booking", `<strong>${esc(booking.id)}</strong>`],
            ["Psikolog", esc(booking.psychologistName)],
            ["Jadwal", `${esc(formatDate(booking.date))}, ${esc(formatTime(booking.time))}`],
            ["Metode konsultasi", esc(booking.method)],
            ["Biaya konsultasi", rupiah(booking.price)],
            ...(booking.paymentMethod ? [["Dibayar dengan", esc(booking.paymentMethod)]] : []),
            ["Status pembayaran", `<span class="badge badge-${statusClass(booking.paymentStatus)}">${esc(booking.paymentStatus)}</span>`]
        ], booking.price).replace("Total biaya", "Total pembayaran");
    }

    function openPayment(bookingId) {
        const user = currentUser();
        if (!user) {
            afterLogin = () => openPayment(bookingId);
            openAuth("Masuk dulu untuk membayar booking.");
            return;
        }

        // Booking harus ada dan milik pasien yang sedang login
        const booking = Store.bookings().find(item => item.id === bookingId && item.userId === user.id);

        if (!booking) {
            toast("Booking tidak ditemukan.");
            return;
        }
        if (booking.status === "Dibatalkan") {
            toast("Booking ini sudah dibatalkan, jadi tidak bisa dibayar.");
            return;
        }
        if (booking.paymentStatus === "Lunas") {
            toast("Booking ini sudah dibayar.");
            return;
        }

        activePaymentId = booking.id;
        paymentSummary.innerHTML = paymentSummaryHTML(booking);
        $("#paymentChoices").innerHTML = window.PC.PAYMENT_METHODS.map(method =>
            choiceHTML("payment", method, method, false)
        ).join("");
        $("#paySubmit").textContent = `Bayar ${rupiah(booking.price)}`;
        showError($("#paymentError"), "");
        paymentForm.hidden = false;
        openModal(paymentModal);
    }

    paymentForm.addEventListener("submit", event => {
        event.preventDefault();

        const user = currentUser();
        const bookings = Store.bookings();
        const booking = bookings.find(item => item.id === activePaymentId && item.userId === user?.id);

        if (!booking) {
            closeModal(paymentModal);
            toast("Booking tidak ditemukan.");
            return;
        }
        if (booking.status === "Dibatalkan") {
            closeModal(paymentModal);
            toast("Booking ini sudah dibatalkan.");
            renderHistory();
            return;
        }

        const method = $("input[name='payment']:checked", paymentForm)?.value;
        if (!method) {
            showError($("#paymentError"), "Pilih metode pembayaran terlebih dahulu.");
            return;
        }

        // SIMULASI: tidak memproses uang sungguhan
        booking.paymentMethod = method;
        booking.paymentStatus = "Lunas";
        booking.paidAt = new Date().toISOString();
        if (!Store.saveBookings(bookings)) return;

        paymentForm.hidden = true;
        paymentSummary.innerHTML = `
            <div class="success-note">
                <strong>Pembayaran berhasil</strong>
                <span>Admin akan mengonfirmasi jadwalmu. Pantau statusnya di Booking Saya.</span>
            </div>
            ${paymentSummaryHTML(booking)}`;

        activePaymentId = null;
        renderHistory();
        toast("Pembayaran berhasil.");
    });

    // =====================================
    // 7. BOOKING SAYA (UC-04)
    // =====================================
    const bookingHistory = $("#bookingHistory");

    function statusTrackHTML(status) {
        const flow = status === "Dibatalkan"
            ? ["Menunggu", "Dibatalkan"]
            : ["Menunggu", "Dikonfirmasi", "Selesai"];
        const current = flow.indexOf(status);

        return `<ol class="status-track" aria-label="Status konsultasi">
            ${flow.map((step, index) => `
                <li class="${index < current ? "is-done" : ""} ${index === current ? "is-current" : ""} ${step === "Dibatalkan" ? "is-cancel" : ""}"><span>${step}</span></li>
            `).join("")}
        </ol>`;
    }

    function renderHistory() {
        const user = currentUser();

        if (!user) {
            bookingHistory.innerHTML = `
                <div class="empty-box">
                    <p>Masuk dulu untuk melihat booking milikmu.</p>
                    <button class="btn btn-pink btn-sm" type="button" data-open-login>Masuk / Daftar</button>
                </div>`;
            return;
        }

        // Pasien hanya bisa melihat booking miliknya sendiri
        const mine = Store.bookings().filter(item => item.userId === user.id);

        if (mine.length === 0) {
            bookingHistory.innerHTML = `
                <div class="empty-box">
                    <p>Kamu belum punya booking. Pilih psikolog untuk memulai.</p>
                    <a class="btn btn-pink btn-sm" href="#psikolog">Cari psikolog</a>
                </div>`;
            return;
        }

        bookingHistory.innerHTML = mine.map(booking => {
            const canPay = booking.paymentStatus !== "Lunas" &&
                booking.status !== "Dibatalkan" && booking.status !== "Selesai";
            const canCancel = booking.status === "Menunggu";

            return `
                <article class="booking-card">
                    <header>
                        <span class="pill pill-flat pill-xs">${esc(booking.id)}</span>
                        <span class="badge badge-${statusClass(booking.paymentStatus)}">${esc(booking.paymentStatus)}</span>
                    </header>

                    <h3>${esc(booking.psychologistName)}</h3>
                    <p class="muted">${esc(booking.specialization || "Konsultasi psikologi")}</p>

                    <dl class="facts-grid">
                        <div><dt>Jadwal</dt><dd>${esc(formatDate(booking.date))}, ${esc(formatTime(booking.time))}</dd></div>
                        <div><dt>Metode</dt><dd>${esc(booking.method)}</dd></div>
                        <div><dt>Total pembayaran</dt><dd><strong>${rupiah(booking.price)}</strong></dd></div>
                    </dl>

                    ${statusTrackHTML(booking.status)}

                    ${canPay || canCancel ? `
                        <div class="btn-row">
                            ${canCancel ? `<button class="btn btn-white btn-sm" type="button" data-cancel="${esc(booking.id)}">Batalkan</button>` : ""}
                            ${canPay ? `<button class="btn btn-pink btn-sm" type="button" data-pay="${esc(booking.id)}">Bayar</button>` : ""}
                        </div>` : ""}
                </article>`;
        }).join("");
    }

    $("#refreshHistory").addEventListener("click", () => {
        renderHistory();
        toast("Booking diperbarui.");
    });

    bookingHistory.addEventListener("click", event => {
        const payButton = event.target.closest("[data-pay]");
        const cancelButton = event.target.closest("[data-cancel]");

        if (payButton) openPayment(payButton.dataset.pay);

        if (cancelButton) {
            const user = currentUser();
            const bookings = Store.bookings();
            const booking = bookings.find(item => item.id === cancelButton.dataset.cancel && item.userId === user?.id);

            if (!booking || booking.status !== "Menunggu") {
                toast("Booking ini tidak bisa dibatalkan lagi.");
                renderHistory();
                return;
            }

            const extra = booking.paymentStatus === "Lunas"
                ? "\nPembayaran yang sudah masuk perlu diurus langsung dengan admin."
                : "";

            if (!window.confirm(`Batalkan booking ${booking.id}? Jadwalnya akan dilepas.${extra}`)) return;

            booking.status = "Dibatalkan";
            Store.saveBookings(bookings);
            renderHistory();
            toast("Booking dibatalkan.");
        }
    });

    // =====================================
    // 8. INISIALISASI
    // =====================================
    window.PC.bindModals();

    // Perubahan dari halaman admin (tab lain) ikut tampil tanpa muat ulang
    window.addEventListener("storage", () => {
        populateSpecializationFilter();
        renderPsychologists();
        renderAuthArea();
        renderHistory();
        if (draft && !bookingModal.hidden && !bookStep1.hidden) renderSlots();
    });

    populateSpecializationFilter();
    renderPsychologists();
    renderAuthArea();
    renderHistory();
});
