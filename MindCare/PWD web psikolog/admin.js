/* =========================================
   MINDCARE - ADMIN.JS (halaman admin)
   UC-05 Mengelola Layanan Konsultasi
   - Kelola psikolog, jadwal praktik, metode, dan harga
   - Kelola booking pasien dan statusnya
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const {
        $, $$, esc, rupiah, Store, Auth, DAY_ORDER, ALL_TIMES, METHODS, STATUSES,
        formatDate, formatTime, formatDays, generateId, takenSlots, statusClass,
        avatarHTML, toast, openModal
    } = window.PC;

    const loginSection = $("#adminLogin");
    const appSection = $("#adminApp");
    const logoutButton = $("#logoutAdmin");

    const currentAdmin = () => Auth.current("admin");

    function showError(element, message) {
        element.textContent = message;
        element.hidden = !message;
    }

    // Semua aksi pengelolaan wajib login sebagai admin
    function requireAdmin() {
        if (currentAdmin()) return true;
        gate();
        toast("Masuk sebagai admin dulu.");
        return false;
    }

    // =====================================
    // 1. LOGIN ADMIN
    // =====================================
    function gate() {
        const admin = currentAdmin();
        loginSection.hidden = !!admin;
        appSection.hidden = !admin;
        logoutButton.hidden = !admin;

        if (admin) renderAll();
    }

    $("#adminLoginForm").addEventListener("submit", event => {
        event.preventDefault();
        const result = Auth.login($("#adminEmail").value, $("#adminPassword").value, "admin");

        if (!result.ok) {
            showError($("#adminLoginError"), result.error);
            return;
        }
        event.target.reset();
        showError($("#adminLoginError"), "");
        gate();
        toast("Berhasil masuk sebagai admin.");
    });

    logoutButton.addEventListener("click", () => {
        Auth.logout("admin");
        closeForm();
        gate();
        toast("Kamu sudah keluar.");
    });

    // =====================================
    // 2. TAB DAN RINGKASAN
    // =====================================
    function setTab(tab) {
        const isPsy = tab === "psy";
        $("#panelPsy").hidden = !isPsy;
        $("#panelBook").hidden = isPsy;
        $("#tabPsy").setAttribute("aria-selected", String(isPsy));
        $("#tabBook").setAttribute("aria-selected", String(!isPsy));
    }

    $$("[data-admin-tab]").forEach(button => {
        button.addEventListener("click", () => setTab(button.dataset.adminTab));
    });

    function renderStats() {
        const psychologists = Store.psychologists();
        const bookings = Store.bookings();
        const waiting = bookings.filter(item => item.status === "Menunggu").length;
        const unpaid = bookings.filter(item =>
            item.paymentStatus !== "Lunas" && item.status !== "Dibatalkan").length;

        $("#adminStats").innerHTML = `
            <li class="pill">${psychologists.length} psikolog</li>
            <li class="pill">${psychologists.filter(item => item.availability === "Tersedia").length} tersedia</li>
            <li class="pill">${waiting} booking menunggu</li>
            <li class="pill">${unpaid} belum dibayar</li>`;
    }

    // =====================================
    // 3. KELOLA PSIKOLOG DAN JADWAL
    // =====================================
    const formPanel = $("#adminFormPanel");
    const form = $("#psychologistForm");

    const checkChoice = (name, value, label) => `
        <label class="choice">
            <input type="checkbox" name="${name}" value="${esc(value)}">
            <span>${esc(label)}</span>
        </label>`;

    function buildFormChoices() {
        $("#adminMethods").innerHTML = METHODS.map(item => checkChoice("methods", item, item)).join("");
        $("#adminDays").innerHTML = DAY_ORDER.map(item => checkChoice("days", item, item)).join("");
        $("#adminTimes").innerHTML = ALL_TIMES.map(item => checkChoice("times", item, formatTime(item))).join("");
    }

    function checkedValues(name) {
        return $$(`input[name='${name}']:checked`, form).map(input => input.value);
    }

    function setChecked(name, values) {
        $$(`input[name='${name}']`, form).forEach(input => {
            input.checked = values.includes(input.value);
        });
    }

    function renderSpecializationOptions() {
        const list = [...new Set(Store.psychologists().map(item => item.specialization).filter(Boolean))];
        $("#specializationOptions").innerHTML = list.map(item => `<option value="${esc(item)}">`).join("");
    }

    function closeForm() {
        form.reset();
        $("#editPsychologistId").value = "";
        $("#adminFormTitle").textContent = "Tambah psikolog";
        showError($("#psychologistError"), "");
        formPanel.hidden = true;
    }

    function openForm(title) {
        $("#adminFormTitle").textContent = title;
        showError($("#psychologistError"), "");
        formPanel.hidden = false;
        formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        $("#adminName").focus({ preventScroll: true });
    }

    $("#addPsychologist").addEventListener("click", () => {
        if (!requireAdmin()) return;
        closeForm();
        setChecked("methods", ["Online"]);
        setChecked("days", ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]);
        setChecked("times", ["09:00", "10:00", "13:00", "14:00"]);
        openForm("Tambah psikolog");
    });

    $("#cancelPsychologistForm").addEventListener("click", closeForm);

    function renderPsychologistTable() {
        const list = Store.psychologists();
        const body = $("#adminPsychologistTable");

        if (list.length === 0) {
            body.innerHTML = '<tr><td colspan="7" class="table-empty">Belum ada data psikolog. Tambahkan psikolog pertama.</td></tr>';
            return;
        }

        body.innerHTML = list.map(item => `
            <tr>
                <td>
                    <div class="cell-person">
                        ${avatarHTML(item, "avatar-xs")}
                        <div><strong>${esc(item.name)}</strong><small>${esc(item.id)}</small></div>
                    </div>
                </td>
                <td>${esc(item.specialization)}</td>
                <td>${rupiah(item.price)}</td>
                <td>${(item.methods || []).map(method => `<span class="tag">${esc(method)}</span>`).join("") || "-"}</td>
                <td>
                    <strong>${esc(formatDays(item.days) || "-")}</strong>
                    <small>${esc((item.times || []).map(formatTime).join(", ") || "Belum ada jam")}</small>
                </td>
                <td><span class="badge ${item.availability === "Tersedia" ? "badge-ok" : "badge-bad"}">${esc(item.availability)}</span></td>
                <td>
                    <div class="btn-row btn-row-tight">
                        <button class="btn btn-yellow btn-xs" type="button" data-edit="${esc(item.id)}">Edit</button>
                        <button class="btn btn-white btn-xs" type="button" data-delete="${esc(item.id)}">Hapus</button>
                    </div>
                </td>
            </tr>`).join("");
    }

    function editPsychologist(id) {
        const item = Store.psychologists().find(entry => entry.id === id);
        if (!item) return;

        $("#editPsychologistId").value = item.id;
        $("#adminName").value = item.name;
        $("#adminSpecialization").value = item.specialization;
        $("#adminPrice").value = item.price;
        $("#adminAvailability").value = item.availability;
        $("#adminPhoto").value = item.photo || "";
        $("#adminDescription").value = item.description || "";
        setChecked("methods", item.methods || []);
        setChecked("days", item.days || []);
        setChecked("times", item.times || []);

        openForm(`Edit data ${item.name}`);
    }

    $("#adminPsychologistTable").addEventListener("click", event => {
        const editButton = event.target.closest("[data-edit]");
        const deleteButton = event.target.closest("[data-delete]");

        if (editButton && requireAdmin()) editPsychologist(editButton.dataset.edit);

        if (deleteButton && requireAdmin()) {
            const list = Store.psychologists();
            const item = list.find(entry => entry.id === deleteButton.dataset.delete);
            if (!item) return;

            const active = Store.bookings().filter(booking =>
                booking.psychologistId === item.id &&
                (booking.status === "Menunggu" || booking.status === "Dikonfirmasi")).length;

            const warning = active > 0
                ? `\n\nAda ${active} booking aktif untuk psikolog ini. Booking tetap tersimpan, tapi psikolog hilang dari katalog.`
                : "";

            if (!window.confirm(`Hapus data ${item.name}?${warning}`)) return;

            Store.savePsychologists(list.filter(entry => entry.id !== item.id));
            if ($("#editPsychologistId").value === item.id) closeForm();
            renderAll();
            toast("Data psikolog dihapus.");
        }
    });

    form.addEventListener("submit", event => {
        event.preventDefault();
        if (!requireAdmin()) return;

        const errorBox = $("#psychologistError");
        const name = $("#adminName").value.trim();
        const specialization = $("#adminSpecialization").value.trim();
        const price = Number($("#adminPrice").value);
        const availability = $("#adminAvailability").value;
        const photo = $("#adminPhoto").value.trim();
        const description = $("#adminDescription").value.trim();
        const methods = checkedValues("methods");
        const days = DAY_ORDER.filter(day => checkedValues("days").includes(day));
        const times = ALL_TIMES.filter(time => checkedValues("times").includes(time));

        let message = "";
        if (name.length < 2) message = "Nama psikolog wajib diisi.";
        else if (!specialization) message = "Spesialisasi wajib diisi.";
        else if (!Number.isFinite(price) || price <= 0) message = "Harga konsultasi harus berupa angka lebih dari nol.";
        else if (methods.length === 0) message = "Pilih minimal satu metode konsultasi.";
        else if (days.length === 0) message = "Pilih minimal satu hari praktik.";
        else if (times.length === 0) message = "Pilih minimal satu jam praktik.";
        else if (photo && !/^https?:\/\//i.test(photo)) message = "Link foto harus diawali http:// atau https://.";

        showError(errorBox, message);
        if (message) return;

        const list = Store.psychologists();
        const existingId = $("#editPsychologistId").value;
        const data = {
            name, specialization, price: Math.round(price), methods, days, times,
            availability, photo,
            description: description || "Layanan konsultasi psikologi sesuai kebutuhanmu."
        };

        if (existingId) {
            const index = list.findIndex(item => item.id === existingId);
            if (index === -1) {
                showError(errorBox, "Data psikolog yang diedit sudah tidak ada.");
                return;
            }
            list[index] = { ...list[index], ...data };
            toast("Data psikolog diperbarui.");
        } else {
            list.push({ id: generateId("PS"), ...data });
            toast("Psikolog baru ditambahkan.");
        }

        if (!Store.savePsychologists(list)) return;
        closeForm();
        renderAll();
    });

    // =====================================
    // 4. KELOLA BOOKING PASIEN
    // =====================================
    const bookingFilter = $("#bookingFilter");

    bookingFilter.innerHTML += STATUSES.map(item => `<option value="${item}">${item}</option>`).join("");

    function renderBookingTable() {
        const filter = bookingFilter.value;
        const all = Store.bookings();
        const list = all.filter(item => !filter || item.status === filter);
        const body = $("#adminBookingTable");

        if (list.length === 0) {
            body.innerHTML = `<tr><td colspan="8" class="table-empty">${
                all.length === 0 ? "Belum ada booking dari pasien." : "Tidak ada booking dengan status ini."
            }</td></tr>`;
            return;
        }

        body.innerHTML = list.map(booking => `
            <tr>
                <td><strong>${esc(booking.id)}</strong></td>
                <td>
                    <strong>${esc(booking.patientName)}</strong>
                    <small>${esc(booking.email)}</small>
                </td>
                <td>${esc(booking.psychologistName)}</td>
                <td>
                    ${esc(formatDate(booking.date))}
                    <small>${esc(formatTime(booking.time))} · ${esc(booking.method)}</small>
                </td>
                <td>${rupiah(booking.price)}</td>
                <td><span class="badge badge-${statusClass(booking.paymentStatus)}">${esc(booking.paymentStatus)}</span></td>
                <td>
                    <select class="select-sm" data-status="${esc(booking.id)}"
                            aria-label="Status booking ${esc(booking.id)}">
                        ${STATUSES.map(status => `
                            <option value="${status}" ${booking.status === status ? "selected" : ""}>${status}</option>
                        `).join("")}
                    </select>
                </td>
                <td><button class="btn btn-white btn-xs" type="button" data-detail="${esc(booking.id)}">Detail</button></td>
            </tr>`).join("");
    }

    bookingFilter.addEventListener("change", renderBookingTable);

    $("#adminBookingTable").addEventListener("change", event => {
        const select = event.target.closest("[data-status]");
        if (!select || !requireAdmin()) return;

        const bookings = Store.bookings();
        const booking = bookings.find(item => item.id === select.dataset.status);
        if (!booking) return;

        const newStatus = select.value;
        if (newStatus === booking.status) return;

        if (newStatus === "Selesai" && booking.paymentStatus !== "Lunas") {
            toast("Booking harus dibayar dulu sebelum ditandai selesai.");
            select.value = booking.status;
            return;
        }

        // Mengaktifkan lagi booking yang dibatalkan: jadwalnya tidak boleh sudah dipakai orang lain
        if (booking.status === "Dibatalkan" &&
            takenSlots(booking.psychologistId, booking.date, booking.id).includes(booking.time)) {
            toast("Jadwal booking ini sudah dipakai booking lain, jadi tidak bisa diaktifkan lagi.");
            select.value = booking.status;
            return;
        }

        booking.status = newStatus;
        if (!Store.saveBookings(bookings)) return;

        renderAll();
        toast(`Status ${booking.id} menjadi ${newStatus}.`);
    });

    $("#adminBookingTable").addEventListener("click", event => {
        const button = event.target.closest("[data-detail]");
        if (!button) return;

        const booking = Store.bookings().find(item => item.id === button.dataset.detail);
        if (!booking) return;

        const rows = [
            ["Nomor booking", `<strong>${esc(booking.id)}</strong>`],
            ["Dibuat", esc(new Date(booking.createdAt).toLocaleString("id-ID"))],
            ["Pasien", esc(booking.patientName)],
            ["Email", esc(booking.email)],
            ["WhatsApp / HP", esc(booking.phone || "-")],
            ["Psikolog", `${esc(booking.psychologistName)} (${esc(booking.specialization || "-")})`],
            ["Jadwal", `${esc(formatDate(booking.date))}, ${esc(formatTime(booking.time))}`],
            ["Metode", esc(booking.method)],
            ["Catatan pasien", esc(booking.notes || "-")],
            ["Metode pembayaran", esc(booking.paymentMethod || "-")],
            ["Status pembayaran", `<span class="badge badge-${statusClass(booking.paymentStatus)}">${esc(booking.paymentStatus)}</span>`],
            ["Status konsultasi", `<span class="badge badge-${statusClass(booking.status)}">${esc(booking.status)}</span>`]
        ];

        $("#detailBody").innerHTML = `
            <dl class="summary-list">
                ${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}
                <div class="summary-total"><dt>Total pembayaran</dt><dd>${rupiah(booking.price)}</dd></div>
            </dl>`;
        openModal($("#detailModal"));
    });

    // =====================================
    // 5. INISIALISASI
    // =====================================
    function renderAll() {
        renderStats();
        renderSpecializationOptions();
        renderPsychologistTable();
        renderBookingTable();
    }

    window.PC.bindModals();
    buildFormChoices();
    gate();

    // Perubahan dari halaman pasien (tab lain) ikut tampil
    window.addEventListener("storage", () => {
        if (currentAdmin()) renderAll();
    });
});
