const nama = document.getElementById("nama");
const jurusan = document.getElementById("jurusan");
const daftar = document.getElementById("daftar");
const hasil = document.getElementById("hasil");

daftar.addEventListener("click", function() {

    let namaMahasiswa = nama.value;
    let jurusanMahasiswa = jurusan.value;

    if (namaMahasiswa === "" || jurusanMahasiswa === "") {
        hasil.textContent = "Data belum lengkap";
    } else {
        hasil.textContent = "Pendaftaran berhasil. Nama: " 
            + namaMahasiswa 
            + ", Jurusan: " 
            + jurusanMahasiswa;
    }

});