
/* ===== 1. MODE GELAP DAN TERANG ===== */

const tombolTema = document.getElementById("tombol-tema");
const temaTersimpan = localStorage.getItem("tema");

if (temaTersimpan === "gelap") {
    document.body.classList.add("gelap");
    tombolTema.textContent = "Mode terang";
} else {
    tombolTema.textContent = "Mode gelap";
}

tombolTema.addEventListener("click", function () {
    document.body.classList.toggle("gelap");

    if (document.body.classList.contains("gelap")) {
        tombolTema.textContent = "Mode terang";
        localStorage.setItem("tema", "gelap");
    } else {
        tombolTema.textContent = "Mode gelap";
        localStorage.setItem("tema", "terang");
    }
});


/* ===== 2. EFEK MENGETIK JUDUL ===== */

const teksJudul = "Halo, saya Novi Aulia";
const tempatMengetik = document.getElementById("typing-text");

let indeksHuruf = 0;

function efekMengetik() {
    if (indeksHuruf < teksJudul.length) {
        tempatMengetik.textContent += teksJudul.charAt(indeksHuruf);
        indeksHuruf++;

        setTimeout(efekMengetik, 100);
    }
}

efekMengetik();


/* ===== 3. EFEK FLIP CARD ===== */

const semuaKartu = document.querySelectorAll(".kartu");

semuaKartu.forEach(function (kartu) {

    kartu.addEventListener("click", function (event) {

        // Jangan membalik card saat tombol Buka Proyek diklik
        if (event.target.closest("a")) {
            return;
        }

        kartu.classList.toggle("aktif");
    });

    // Mendukung tombol Enter dan Spasi
    kartu.addEventListener("keydown", function (event) {

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            kartu.classList.toggle("aktif");
        }

    });

});


/* ===== 4. PENCARIAN PROYEK ===== */

const kotakCari = document.getElementById("cari");
const pesanKosong = document.getElementById("pesan-kosong");

kotakCari.addEventListener("input", function () {

    const kataKunci = kotakCari.value.toLowerCase();
    let adaYangCocok = false;

    semuaKartu.forEach(function (kartu) {

        const isiKartu = kartu.textContent.toLowerCase();

        if (isiKartu.includes(kataKunci)) {
            kartu.style.display = "";
            adaYangCocok = true;
        } else {
            kartu.style.display = "none";
        }

    });

    if (adaYangCocok) {
        pesanKosong.style.display = "none";
    } else {
        pesanKosong.style.display = "block";
    }

});
