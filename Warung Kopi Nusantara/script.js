
const produkData = [
    {
        id: 1,
        nama: "Kopi Arabika",
        harga: 45000,
        kategori: "biji",
        icon: "☕",
        deskripsi: "Kopi Arabika dengan aroma harum dan rasa yang lembut."
    },
    {
        id: 2,
        nama: "Kopi Robusta",
        harga: 35000,
        kategori: "biji",
        icon: "🫘",
        deskripsi: "Kopi Robusta dengan karakter rasa kuat dan pekat."
    },
    {
        id: 3,
        nama: "Kopi Liberika",
        harga: 50000,
        kategori: "biji",
        icon: "☕",
        deskripsi: "Kopi Liberika dengan aroma khas dan cita rasa unik."
    },
    {
        id: 4,
        nama: "Kopi Bubuk Premium",
        harga: 30000,
        kategori: "bubuk",
        icon: "📦",
        deskripsi: "Kopi bubuk pilihan yang praktis untuk diseduh."
    },
    {
        id: 5,
        nama: "Kopi Susu",
        harga: 15000,
        kategori: "minuman",
        icon: "🥛",
        deskripsi: "Perpaduan kopi dan susu dengan rasa yang lembut."
    },
    {
        id: 6,
        nama: "Es Kopi Gula Aren",
        harga: 18000,
        kategori: "minuman",
        icon: "🧋",
        deskripsi: "Minuman kopi dingin dengan manisnya gula aren."
    }
];

// Data keranjang selama halaman terbuka.
let cart = [];
let kategoriAktif = "semua";
let toastTimeout;

function formatRupiah(harga) {
    return "Rp " + harga.toLocaleString("id-ID");
}

// Menampilkan notifikasi singkat.
function tampilkanToast(pesan) {
    clearTimeout(toastTimeout);

    $("#toast").text(pesan).addClass("show");

    toastTimeout = setTimeout(function() {
        $("#toast").removeClass("show");
    }, 2500);
}

// Membuat kartu produk dari array.
function renderProduk(data = produkData) {
    const grid = $("#produkGrid");

    grid.empty();

    if (data.length === 0) {
        grid.html(`
            <div class="empty-state">
                <h3>Produk tidak ditemukan</h3>
                <p>Coba kata kunci atau kategori lainnya.</p>
            </div>
        `);
        return;
    }

    data.forEach(function(produk) {
        const card = `
            <article class="produk-card">
                <div class="produk-icon" aria-hidden="true">
                    ${produk.icon}
                </div>

                <span class="produk-category">
                    ${produk.kategori === "biji"
                        ? "Biji Kopi"
                        : produk.kategori === "bubuk"
                            ? "Kopi Bubuk"
                            : "Minuman"}
                </span>

                <h3>${produk.nama}</h3>

                <p class="produk-description">
                    ${produk.deskripsi}
                </p>

                <p class="harga">
                    ${formatRupiah(produk.harga)}
                </p>

                <button
                    class="btn-add-cart"
                    type="button"
                    data-id="${produk.id}">
                    + Tambah ke Keranjang
                </button>
            </article>
        `;

        grid.append(card);
    });
}

// Filter kategori dan pencarian.
function filterProduk() {
    const kataKunci = $("#inputCari").val()
        .toLowerCase()
        .trim();

    const hasil = produkData.filter(function(produk) {
        const cocokKategori =
            kategoriAktif === "semua" ||
            produk.kategori === kategoriAktif;

        const cocokKata =
            produk.nama.toLowerCase().includes(kataKunci) ||
            produk.deskripsi.toLowerCase().includes(kataKunci) ||
            produk.kategori.toLowerCase().includes(kataKunci);

        return cocokKategori && cocokKata;
    });

    renderProduk(hasil);
}

// Membuka dan menutup keranjang.
function bukaKeranjang() {
    $("#cartSidebar").addClass("open");
    $("#pageOverlay").addClass("show");
}

function tutupKeranjang() {
    $("#cartSidebar").removeClass("open");
    $("#pageOverlay").removeClass("show");
}

// Menghitung total barang dan harga.
function hitungJumlahItem() {
    return cart.reduce(function(total, item) {
        return total + item.qty;
    }, 0);
}

function hitungTotal() {
    return cart.reduce(function(total, item) {
        return total + item.harga * item.qty;
    }, 0);
}

// Memperbarui isi keranjang.
function updateCartUI() {
    const container = $("#cartItems");

    container.empty();

    if (cart.length === 0) {
        container.html(`
            <div class="cart-empty">
                <div style="font-size: 42px;">🛒</div>
                <p>Keranjang kamu masih kosong.</p>
                <p>Pilih kopi favoritmu terlebih dahulu.</p>
            </div>
        `);
    }

    cart.forEach(function(item) {
        const subtotal = item.harga * item.qty;

        container.append(`
            <div class="cart-item">
                <h4>${item.icon} ${item.nama}</h4>

                <p class="cart-item-price">
                    ${formatRupiah(item.harga)} per item
                </p>

                <div class="cart-controls">
                    <button
                        class="qty-btn"
                        type="button"
                        data-id="${item.id}"
                        data-aksi="kurang"
                        aria-label="Kurangi ${item.nama}">−</button>

                    <span>${item.qty}</span>

                    <button
                        class="qty-btn"
                        type="button"
                        data-id="${item.id}"
                        data-aksi="tambah"
                        aria-label="Tambah ${item.nama}">+</button>

                    <strong>${formatRupiah(subtotal)}</strong>

                    <button
                        class="cart-item-remove"
                        type="button"
                        data-id="${item.id}">Hapus</button>
                </div>
            </div>
        `);
    });

    $("#cartCount").text(hitungJumlahItem());
    $("#cartTotal").text(formatRupiah(hitungTotal()));
    $("#checkoutTotal").text(formatRupiah(hitungTotal()));
}

// Menambahkan produk ke keranjang.
$(document).on("click", ".btn-add-cart", function() {
    const id = Number($(this).attr("data-id"));

    const produk = produkData.find(function(item) {
        return item.id === id;
    });

    if (!produk) return;

    const item = cart.find(function(item) {
        return item.id === id;
    });

    if (item) {
        item.qty++;
    } else {
        cart.push({
            ...produk,
            qty: 1
        });
    }

    updateCartUI();
    tampilkanToast(produk.nama + " ditambahkan ke keranjang.");
});

// Menambah atau mengurangi jumlah produk.
$(document).on("click", ".qty-btn", function() {
    const id = Number($(this).attr("data-id"));
    const aksi = $(this).attr("data-aksi");

    const item = cart.find(function(item) {
        return item.id === id;
    });

    if (!item) return;

    if (aksi === "tambah") {
        item.qty++;
    } else {
        item.qty--;

        if (item.qty <= 0) {
            cart = cart.filter(function(item) {
                return item.id !== id;
            });
        }
    }

    updateCartUI();
});

// Menghapus produk dari keranjang.
$(document).on("click", ".cart-item-remove", function() {
    const id = Number($(this).attr("data-id"));

    cart = cart.filter(function(item) {
        return item.id !== id;
    });

    updateCartUI();
    tampilkanToast("Produk dihapus dari keranjang.");
});

// Membuka keranjang.
$("#cartBtn").on("click", bukaKeranjang);

// Menutup keranjang.
$("#closeCart, #pageOverlay").on("click", tutupKeranjang);

// Memilih kategori.
$(document).on("click", ".filter-btn", function() {
    $(".filter-btn").removeClass("active");
    $(this).addClass("active");

    kategoriAktif = $(this).attr("data-kategori");

    filterProduk();
});

// Pencarian langsung saat pengguna mengetik.
$("#inputCari").on("input", filterProduk);

// Validasi nama.
function validasiNama() {
    const nama = $("#inputNama").val().trim();
    const valid = nama.length >= 3;

    $("#errorNama").text(
        valid ? "" : "Nama harus terdiri dari minimal 3 karakter."
    );

    return valid;
}

// Validasi nomor WhatsApp.
function validasiWA() {
    const nomor = $("#inputWA").val().trim();
    const valid = /^\d{10,14}$/.test(nomor);

    $("#errorWA").text(
        valid ? "" : "Masukkan 10 sampai 14 digit angka."
    );

    return valid;
}

// Validasi alamat.
function validasiAlamat() {
    const alamat = $("#inputAlamat").val().trim();
    const valid = alamat.length >= 10;

    $("#errorAlamat").text(
        valid ? "" : "Alamat harus terdiri dari minimal 10 karakter."
    );

    return valid;
}

// Validasi langsung ketika field diisi.
$("#inputNama").on("input", validasiNama);
$("#inputWA").on("input", validasiWA);
$("#inputAlamat").on("input", validasiAlamat);

// Membuka form checkout.
$("#checkoutBtn").on("click", function() {
    if (cart.length === 0) {
        tampilkanToast("Keranjang masih kosong.");
        return;
    }

    tutupKeranjang();
    $("#checkoutTotal").text(formatRupiah(hitungTotal()));
    $("#checkoutModal").addClass("show");
});

// Menutup modal checkout.
$("#closeCheckout").on("click", function() {
    $("#checkoutModal").removeClass("show");
});

// Memproses checkout simulasi.
$("#checkoutForm").on("submit", function(e) {
    e.preventDefault();

    const namaValid = validasiNama();
    const waValid = validasiWA();
    const alamatValid = validasiAlamat();

    const metode = $('input[name="metode"]:checked').val();

    $("#errorMetode").text(
        metode ? "" : "Silakan pilih metode pengambilan."
    );

    if (!namaValid || !waValid || !alamatValid || !metode) {
        tampilkanToast("Periksa kembali data pemesanan.");
        return;
    }

    if (cart.length === 0) {
        $("#checkoutModal").removeClass("show");
        tampilkanToast("Keranjang masih kosong.");
        return;
    }

    // Simpan ringkasan sebelum keranjang dikosongkan.
    const pesanan = {
        nomor: "WKN-" + Date.now().toString().slice(-8),
        nama: $("#inputNama").val().trim(),
        whatsapp: $("#inputWA").val().trim(),
        alamat: $("#inputAlamat").val().trim(),
        metode: metode,
        catatan: $("#inputCatatan").val().trim(),
        produk: cart.map(function(item) {
            return {
                id: item.id,
                nama: item.nama,
                harga: item.harga,
                qty: item.qty
            };
        }),
        total: hitungTotal()
    };

    // Simulasi konfirmasi pesanan.
    console.log("Detail pesanan:", pesanan);

    $("#successMessage").text(
        "Terima kasih, " + pesanan.nama +
        ". Total pesanan kamu " + formatRupiah(pesanan.total) + "."
    );

    $("#orderNumber").text(
        "Nomor pesanan: " + pesanan.nomor
    );

    $("#checkoutModal").removeClass("show");
    $("#successModal").addClass("show");

    cart = [];
    updateCartUI();

    this.reset();

    $("#errorNama, #errorWA, #errorAlamat, #errorMetode").text("");
});

// Menutup modal sukses.
$("#closeSuccess").on("click", function() {
    $("#successModal").removeClass("show");
});

// Menutup modal ketika pengguna mengeklik area luar.
$("#checkoutModal, #successModal").on("click", function(e) {
    if (e.target === this) {
        $(this).removeClass("show");
    }
});

// Inisialisasi website.
$(function() {
    renderProduk();
    updateCartUI();
});
