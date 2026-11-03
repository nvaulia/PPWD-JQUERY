<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profil Novi Aulia</title>
    <link rel="stylesheet" href="https://noviaulia1043.infinityfreeapp.com/style.css?v=2">
</head>

<body>
   <header class="header">
    <img src="foto.jpeg" alt="Foto Novi Aulia">
    <h1>Novi Aulia</h1>
    <p>Mahasiswa Program Studi Sistem Informasi</p>
</header>

    <nav class="nav">
        <a href="#tentang">Tentang</a>
        <a href="#jadwal">Jadwal</a>
        <a href="#hobi">Hobi</a>
        <a href="#kontak">Kontak</a>
    </nav>
    <main class="konten">
        <section id="tentang">
            <h2>Tentang Saya</h2>
            <p>
                Halo! Saya Novi Aulia, mahasiswa Program Studi Sistem Informasi.
                Saya sedang belajar membuat website menggunakan HTML dan CSS.
                Saya tertarik dengan teknologi informasi dan desain website.
            </p>
            <p>
                Saya memiliki cita-cita sebagai data analyst dan pengusaha.Saya sangat suka berbisnis karena dari kecil saya sudah diajarkan untuk berbisnis oleh orang terdekat saya. Saya berharap dapat mengembangkan keterampilan saya dalam bidang teknologi informasi dan desain website.
            </p>
        </section>
        <section id="jadwal">
            <h2>Jadwal Kuliah</h2>
            <table>
                <tr>
                    <th>Hari</th>
                    <th>Mata Kuliah</th>
                    <th>Jam</th>
                </tr>
                <tr>
                    <td>Senin</td>
                    <td>
                        Pemrograman Web Dasar<br>
                        Basis Data<br>
                        Kewarganegaraan
                    </td>
                    <td>
                        08.20 - 10.00<br>
                        10.20 - 12.50<br>
                        13.30 - 15.10
                    </td>
                </tr>
                <tr>
                    <td>Selasa</td>
                    <td>
                        Manajemen Proyek TI<br>
                        Praktikum Pemrograman Web Dasar
                    </td>
                    <td>
                        07.30 - 09.15<br>
                        10.20 - 13.10
                    </td>
                </tr>
                <tr>
                    <td>Rabu</td>
                    <td>
                        Aplikasi Multimedia<br>
                        Rekayasa Perangkat Lunak
                    </td>
                    <td>
                        07.30 - 10.00<br>
                        10.20 - 12.50
                    </td>
                </tr>
                <tr>
                    <td>Kamis</td>
                    <td>
                        Pemrograman Berorientasi Objek<br>
                        Kewirausahaan Teknologi Informasi
                    </td>
                    <td>
                        10.20 - 12.00<br>
                        13.30 - 15.10
                    </td>
                </tr>
                <tr>
                    <td>Jumat</td>
                    <td>
                        Manajemen Rantai Pasok<br>
                        Praktikum Pemrograman Berorientasi Objek
                    </td>
                    <td>
                        07.30 - 10.00<br>
                        13.30 - 16.20
                    </td>
                </tr>
            </table>
        </section>
        <section id="hobi">
            <h2>Daftar Hobi</h2>
            <table>
                <tr>
                    <th>No</th>
                    <th>Hobi</th>
                </tr>
                <tr>
                    <td>1</td>
                    <td>Menonton</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>Memasak</td>
                </tr>
                <tr>
                    <td>3</td>
                    <td>Traveling</td>
                </tr>
            </table>
        </section>
        <section id="kontak">
            <h2>Formulir Kontak</h2>
            <form>
                <label for="nama">Nama</label>
                <input type="text" id="nama" placeholder="Tulis nama Anda">
                <label for="email">Email</label>
                <input type="email" id="email" placeholder="nama@email.com">
                <label for="pesan">Pesan</label>
                <textarea id="pesan" rows="4"
                    placeholder="Tulis pesan..."></textarea>
                <button type="submit">Kirim Pesan</button>
            </form>
        </section>
    </main>
    <footer class="footer">
        <p>&copy; 2026 Novi Aulia. Dibuat dengan HTML &amp; CSS.</p>
    </footer>
</body>
</html>