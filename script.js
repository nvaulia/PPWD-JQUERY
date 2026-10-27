// ===== 1. Mode gelap / terang =====

// Ambil tombol dari HTML berdasarkan id-nya
const tombolTema = document.getElementById("tombol-tema");

// Saat tombol diklik, tambah/hapus class "gelap" pada <body>
tombolTema.addEventListener("click", function () {
    document.body.classList.toggle("gelap");

    // Ubah tulisan tombol sesuai mode yang sedang aktif
    if (document.body.classList.contains("gelap")) {
        tombolTema.textContent = "Mode terang";
    } else {
        tombolTema.textContent = "Mode gelap";
    }
});

// ===== 2. Pencarian proyek =====

const kotakCari = document.getElementById("cari");
const semuaKartu = document.querySelectorAll(".kartu");
const pesanKosong = document.getElementById("pesan-kosong");

// Dijalankan setiap kali pengguna mengetik di kotak pencarian
kotakCari.addEventListener("input", function () {
    const kataKunci = kotakCari.value.toLowerCase();
    let adaYangCocok = false;

    // Periksa kartu satu per satu
    semuaKartu.forEach(function (kartu) {
        const isiKartu = kartu.textContent.toLowerCase();

        if (isiKartu.includes(kataKunci)) {
            kartu.style.display = "block"; // tampilkan
            adaYangCocok = true;
        } else {
            kartu.style.display = "none"; // sembunyikan
        }
    });

    // Tampilkan pesan jika tidak ada kartu yang cocok
    if (adaYangCocok) {
        pesanKosong.style.display = "none";
    } else {
        pesanKosong.style.display = "block";
    }
});