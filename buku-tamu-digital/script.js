const daftar = document.getElementById("daftar");

document.getElementById("simpan").addEventListener("click", function () {
    const nama = document.getElementById("nama").value;
    const instansi = document.getElementById("instansi").value;

    if (nama === "") {
        alert("Nama wajib diisi");
        return;
    }

    // Buat item daftar baru lalu tambahkan ke halaman
    const item = document.createElement("li");
    item.textContent = nama + " - " + instansi;
    daftar.appendChild(item);

    // Kosongkan isian
    document.getElementById("nama").value = "";
    document.getElementById("instansi").value = "";
});