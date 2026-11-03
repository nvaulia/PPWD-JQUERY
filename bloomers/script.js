/* =========================================================
   BLOOMÉ FLOWERS SHOP - COMPLETE SCRIPT
   by Novi Aulia
   ========================================================= */

$(document).ready(function () {

    /* =====================================================
       INITIAL LOCAL STORAGE DATA SETUP
       ===================================================== */
    const initialProdukData = [
        { id: 1, nama: 'Pink Lily', harga: 35000, kategori: 'lily', gambar: 'pinklily.jpg', desc: 'Lily pink segar dengan kelopak lembut.', badge: 'Favorit', badgeType: '' },
        { id: 2, nama: 'White Lily', harga: 38000, kategori: 'lily', gambar: 'whitelily.jpg', desc: 'Lily putih dengan tampilan bersih dan elegan.', badge: '', badgeType: '' },
        { id: 3, nama: 'Stargazer Lily', harga: 45000, kategori: 'lily', gambar: 'stargizerlily.jpg', desc: 'Lily pink dengan corak dan bintik khas.', badge: 'Best Seller', badgeType: 'hot' },
        { id: 4, nama: 'Oriental Lily', harga: 48000, kategori: 'lily', gambar: 'orientallily.jpg', desc: 'Lily berukuran besar dengan aroma harum.', badge: '', badgeType: '' },
        { id: 5, nama: 'Casablanca Lily', harga: 50000, kategori: 'lily', gambar: 'casablancalily.jpg', desc: 'Lily putih elegan untuk hadiah spesial.', badge: 'Premium', badgeType: '' },
        { id: 6, nama: 'Pink Rose', harga: 30000, kategori: 'rose', gambar: 'pinkrose.jpg', desc: 'Mawar pink segar dengan warna lembut.', badge: 'Favorit', badgeType: '' },
        { id: 7, nama: 'Red Rose', harga: 35000, kategori: 'rose', gambar: 'redrose.jpg', desc: 'Mawar merah klasik untuk berbagai momen.', badge: 'Best Seller', badgeType: 'hot' },
        { id: 8, nama: 'Peach Rose', harga: 38000, kategori: 'rose', gambar: 'peachrose.jpg', desc: 'Mawar peach dengan warna hangat dan lembut.', badge: 'New', badgeType: '' },
        { id: 9, nama: 'Pink Tulip', harga: 40000, kategori: 'tulip', gambar: 'pinktulip.jpg', desc: 'Tulip pink dengan bentuk kelopak yang cantik.', badge: 'Favorit', badgeType: '' },
        { id: 10, nama: 'White Tulip', harga: 42000, kategori: 'tulip', gambar: 'whitetulip.jpg', desc: 'Tulip putih dengan tampilan minimalis.', badge: '', badgeType: '' },
        { id: 11, nama: 'Pink Peony', harga: 55000, kategori: 'peony', gambar: 'pinkpeony.jpg', desc: 'Peony pink dengan kelopak yang penuh dan lembut.', badge: 'Premium', badgeType: '' },
        { id: 12, nama: 'Pink Hydrangea', harga: 45000, kategori: 'other', gambar: 'pinkhydrengea.jpg', desc: 'Hydrangea pink dengan kumpulan bunga yang cantik.', badge: 'New', badgeType: '' },
        { id: 13, nama: "Baby's Breath", harga: 25000, kategori: 'other', gambar: 'babybreath.jpg', desc: 'Bunga kecil putih untuk pelengkap rangkaian.', badge: '', badgeType: '' },
        { id: 14, nama: 'Sunflower', harga: 30000, kategori: 'other', gambar: 'sunflower.jpg', desc: 'Bunga matahari cerah dengan warna kuning khas.', badge: 'Popular', badgeType: '' }
    ];

    function getStoredProducts() {
        const stored = localStorage.getItem('bloome_products');
        if (!stored) {
            localStorage.setItem('bloome_products', JSON.stringify(initialProdukData));
            return initialProdukData;
        }
        return JSON.parse(stored);
    }

    function saveStoredProducts(products) {
        localStorage.setItem('bloome_products', JSON.stringify(products));
    }

    function getStoredOrders() {
        return JSON.parse(localStorage.getItem('bloome_orders') || '[]');
    }

    function saveStoredOrders(orders) {
        localStorage.setItem('bloome_orders', JSON.stringify(orders));
    }

    /* =====================================================
       STATE MANAGEMENT
       ===================================================== */
    let cart = [];
    let currentFilter = 'all';
    let searchKeyword = '';
    let currentUser = JSON.parse(localStorage.getItem('bloome_logged_user') || 'null');

    function getImagePath(namaFile) {
        return '../pictures/' + namaFile;
    }

    /* =====================================================
       EFEK KETIK (TYPEWRITER) NAMA BLOOMÉ
       ===================================================== */
    function startTypewriter(elementId, text, speed) {
        let i = 0;
        const $elem = $('#' + elementId);
        $elem.text('');
        
        function type() {
            if (i < text.length) {
                $elem.text($elem.text() + text.charAt(i));
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    startTypewriter('typewriterLogo', 'Bloomé', 150);
    startTypewriter('typewriterHero', 'Bloomé', 200);

    /* =====================================================
       RENDER PRODUK KATALOG
       ===================================================== */
    function renderProduk() {
        const produkData = getStoredProducts();
        const $grid = $('#produkGrid');
        $grid.empty();

        const filtered = produkData.filter(function (p) {
            const matchKategori = currentFilter === 'all' || p.kategori === currentFilter;
            const keyword = searchKeyword.toLowerCase();
            const matchSearch = p.nama.toLowerCase().includes(keyword) || p.desc.toLowerCase().includes(keyword);
            return matchKategori && matchSearch;
        });

        if (filtered.length === 0) {
            $grid.html(`
                <div class="no-product">
                    <i class="fas fa-seedling"></i>
                    <h3>Bunga tidak ditemukan</h3>
                    <p>Coba kata kunci atau kategori lain.</p>
                </div>
            `);
            return;
        }

        filtered.forEach(function (p) {
            const badgeHtml = p.badge ? `<div class="produk-badge ${p.badgeType}">${p.badge}</div>` : '';
            const card = `
                <div class="produk-card" data-id="${p.id}">
                    ${badgeHtml}
                    <div class="produk-img">
                        <img src="${getImagePath(p.gambar)}" alt="${p.nama}">
                    </div>
                    <div class="produk-info">
                        <h3>${p.nama}</h3>
                        <p class="desc">${p.desc}</p>
                        <div class="produk-footer">
                            <div class="produk-price">
                                Rp ${Number(p.harga).toLocaleString('id-ID')}
                                <small>per bouquet</small>
                            </div>
                            <button type="button" class="btn-add-cart" data-id="${p.id}" title="Tambah ke keranjang">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            $grid.append(card);
        });
    }

    /* =====================================================
       AUTHENTICATION & USER SYSTEM
       ===================================================== */
    function updateAuthUI() {
        if (currentUser) {
            $('#navUserText').text(currentUser.nama);
            $('#userDropdown').hide();
            if (currentUser.role === 'admin') {
                $('#btnMenuAdmin').show();
            } else {
                $('#btnMenuAdmin').hide();
            }
        } else {
            $('#navUserText').text('Login');
            $('#btnMenuAdmin').hide();
            $('#userDropdown').hide();
            $('#adminSection').hide();
        }
    }

    // CEK PERSYARATAN LOGIN SEBELUM MASUK KERANJANG
    function checkLoginRequired() {
        if (!currentUser) {
            showToast('Silakan login terlebih dahulu untuk belanja!');
            $('#authModal').addClass('show');
            return false;
        }
        return true;
    }

    $('#btnLoginNav').click(function (e) {
        e.stopPropagation();
        if (currentUser) {
            $('#userDropdown').toggle();
        } else {
            $('#authModal').addClass('show');
        }
    });

    $(document).click(function () {
        $('#userDropdown').hide();
    });

    $('#authModalClose, .auth-modal-overlay').click(function () {
        $('#authModal').removeClass('show');
    });

    $('#switchToRegister').click(function (e) {
        e.preventDefault();
        $('#formLogin').hide();
        $('#formRegister').show();
        $('#authTitle').html('<i class="fas fa-user-plus"></i> Daftar Akun');
        $('#authSubtitle').text('Buat akun Bloomé Anda sekarang');
    });

    $('#switchToLogin').click(function (e) {
        e.preventDefault();
        $('#formRegister').hide();
        $('#formLogin').show();
        $('#authTitle').html('<i class="fas fa-user-lock"></i> Masuk Akun');
        $('#authSubtitle').text('Masuk ke akun Bloomé Anda');
    });

    // Login Handle
    $('#formLogin').submit(function (e) {
        e.preventDefault();
        const user = $('#loginUser').val().trim();
        const pass = $('#loginPass').val().trim();

        if (user === 'admin' && pass === 'admin123') {
            currentUser = { username: 'admin', nama: 'Admin Bloomé', role: 'admin' };
            localStorage.setItem('bloome_logged_user', JSON.stringify(currentUser));
            updateAuthUI();
            $('#authModal').removeClass('show');
            $('#formLogin')[0].reset();
            showToast('Selamat datang, Admin Bloomé!');
            openAdminPanel();
            return;
        }

        const users = JSON.parse(localStorage.getItem('bloome_registered_users') || '[]');
        const found = users.find(u => (u.username === user || u.nama === user) && u.password === pass);

        if (found) {
            currentUser = { username: found.username, nama: found.nama, role: 'user' };
            localStorage.setItem('bloome_logged_user', JSON.stringify(currentUser));
            updateAuthUI();
            $('#authModal').removeClass('show');
            $('#formLogin')[0].reset();
            showToast(`Selamat datang kembali, ${found.nama}!`);
        } else {
            showToast('Username atau password salah!');
        }
    });

    // Register Handle
    $('#formRegister').submit(function (e) {
        e.preventDefault();
        const nama = $('#regNama').val().trim();
        const user = $('#regUser').val().trim();
        const pass = $('#regPass').val().trim();

        const users = JSON.parse(localStorage.getItem('bloome_registered_users') || '[]');
        if (users.some(u => u.username === user)) {
            showToast('Username sudah terdaftar!');
            return;
        }

        users.push({ nama, username: user, password: pass });
        localStorage.setItem('bloome_registered_users', JSON.stringify(users));
        showToast('Pendaftaran berhasil! Silakan login.');

        $('#switchToLogin').click();
        $('#loginUser').val(user);
    });

    // Logout
    $('#btnLogout').click(function (e) {
        e.preventDefault();
        currentUser = null;
        cart = [];
        updateCartUI();
        localStorage.removeItem('bloome_logged_user');
        updateAuthUI();
        showToast('Anda telah keluar akun.');
    });

    /* =====================================================
       ADMIN PANEL & CRUD PRODUK
       ===================================================== */
    function openAdminPanel() {
        if (!currentUser || currentUser.role !== 'admin') {
            showToast('Akses ditolak! Khusus Admin.');
            return;
        }
        $('#adminSection').slideDown();
        renderAdminProdukTable();
        renderAdminPesananTable();
        $('html, body').animate({ scrollTop: $('#adminSection').offset().top - 50 }, 500);
    }

    $('#btnMenuAdmin').click(function (e) {
        e.preventDefault();
        openAdminPanel();
    });

    $('#btnCloseAdmin').click(function () {
        $('#adminSection').slideUp();
    });

    $('.admin-tab-btn').click(function () {
        $('.admin-tab-btn').removeClass('active');
        $(this).addClass('active');
        const tab = $(this).data('tab');
        $('.admin-tab-content').hide();
        $('#' + tab).show();
    });

    function renderAdminProdukTable() {
        const products = getStoredProducts();
        let html = '';
        products.forEach(p => {
            html += `
                <tr>
                    <td>#${p.id}</td>
                    <td><img src="${getImagePath(p.gambar)}" class="table-img" alt="${p.nama}"></td>
                    <td><strong>${p.nama}</strong></td>
                    <td>${p.kategori}</td>
                    <td>Rp ${Number(p.harga).toLocaleString('id-ID')}</td>
                    <td>
                        <button class="btn-action-edit" onclick="editProduk(${p.id})"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn-action-delete" onclick="deleteProduk(${p.id})"><i class="fas fa-trash"></i> Hapus</button>
                    </td>
                </tr>
            `;
        });
        $('#adminProdukTableBody').html(html);
    }

    // Submit Create / Update Produk
    $('#formProdukAdmin').submit(function (e) {
        e.preventDefault();
        let products = getStoredProducts();
        const id = $('#adminProdId').val();
        const nama = $('#adminProdNama').val().trim();
        const harga = Number($('#adminProdHarga').val());
        const kategori = $('#adminProdKategori').val();
        const gambar = $('#adminProdGambar').val().trim();
        const desc = $('#adminProdDesc').val().trim();
        const badge = $('#adminProdBadge').val().trim();

        if (id) {
            const index = products.findIndex(p => p.id == id);
            if (index !== -1) {
                products[index] = { id: Number(id), nama, harga, kategori, gambar, desc, badge, badgeType: '' };
                showToast('Produk berhasil diperbarui!');
            }
        } else {
            const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
            products.push({ id: newId, nama, harga, kategori, gambar, desc, badge, badgeType: '' });
            showToast('Produk baru berhasil ditambahkan!');
        }

        saveStoredProducts(products);
        renderProduk();
        renderAdminProdukTable();
        resetCrudForm();
    });

    window.editProduk = function (id) {
        const products = getStoredProducts();
        const p = products.find(prod => prod.id == id);
        if (!p) return;

        $('#adminProdId').val(p.id);
        $('#adminProdNama').val(p.nama);
        $('#adminProdHarga').val(p.harga);
        $('#adminProdKategori').val(p.kategori);
        $('#adminProdGambar').val(p.gambar);
        $('#adminProdDesc').val(p.desc);
        $('#adminProdBadge').val(p.badge || '');

        $('#formProdukTitle').text('Edit Produk #' + p.id);
        $('#btnSaveProduk').text('Update Produk');
        $('#btnCancelCrud').show();
    };

    window.deleteProduk = function (id) {
        if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
        let products = getStoredProducts();
        products = products.filter(p => p.id != id);
        saveStoredProducts(products);
        renderProduk();
        renderAdminProdukTable();
        showToast('Produk berhasil dihapus!');
    };

    function resetCrudForm() {
        $('#formProdukAdmin')[0].reset();
        $('#adminProdId').val('');
        $('#formProdukTitle').text('Tambah Produk Baru');
        $('#btnSaveProduk').text('Simpan Produk');
        $('#btnCancelCrud').hide();
    }

    $('#btnCancelCrud').click(resetCrudForm);

    /* =====================================================
       ADMIN KELOLA PESANAN & USER HISTORY
       ===================================================== */
    function renderAdminPesananTable() {
        const orders = getStoredOrders();
        let html = '';
        if (orders.length === 0) {
            $('#adminPesananTableBody').html('<tr><td colspan="8" style="text-align:center;">Belum ada pesanan masuk.</td></tr>');
            return;
        }

        orders.forEach((o, index) => {
            let itemsText = o.items.map(i => `${i.nama} x${i.qty}`).join('<br>');
            html += `
                <tr>
                    <td><strong>#${o.id}</strong><br><small>${o.waktu}</small></td>
                    <td>${o.nama}</td>
                    <td>${o.whatsapp}</td>
                    <td><small>${o.pembayaran || '-'}</small></td>
                    <td><small>${itemsText}</small></td>
                    <td><strong>Rp ${Number(o.total).toLocaleString('id-ID')}</strong></td>
                    <td><span class="badge-status ${o.status.toLowerCase()}">${o.status}</span></td>
                    <td>
                        <button class="btn-action-status" onclick="updateOrderStatus(${index})"><i class="fas fa-sync"></i> Status</button>
                    </td>
                </tr>
            `;
        });
        $('#adminPesananTableBody').html(html);
    }

    window.updateOrderStatus = function (index) {
        const orders = getStoredOrders();
        const current = orders[index].status;
        let nextStatus = 'Menunggu';
        if (current === 'Menunggu') nextStatus = 'Diproses';
        else if (current === 'Diproses') nextStatus = 'Selesai';
        else if (current === 'Selesai') nextStatus = 'Menunggu';

        orders[index].status = nextStatus;
        saveStoredOrders(orders);
        renderAdminPesananTable();
        showToast(`Status pesanan #${orders[index].id} diubah jadi ${nextStatus}`);
    };

    // User History Modal
    $('#btnMenuHistory').click(function (e) {
        e.preventDefault();
        if (!currentUser) return;
        const orders = getStoredOrders().filter(o => o.username === currentUser.username || o.nama.toLowerCase() === currentUser.nama.toLowerCase());
        let html = '';

        if (orders.length === 0) {
            html = '<p style="text-align:center; padding:30px; color:#888;">Belum ada riwayat pesanan.</p>';
        } else {
            orders.forEach(o => {
                let itemLines = o.items.map(i => `<div class="history-item-line"><span>${i.nama} (${i.qty}x)</span> <span>Rp ${(i.harga * i.qty).toLocaleString('id-ID')}</span></div>`).join('');
                html += `
                    <div class="history-card">
                        <div class="history-header-info">
                            <span>Kode: <strong>#${o.id}</strong> | ${o.waktu}</span>
                            <span class="badge-status ${o.status.toLowerCase()}">${o.status}</span>
                        </div>
                        ${itemLines}
                        <div style="font-size:0.8rem; color:#666; margin-top:5px;">Metode Bayar: ${o.pembayaran || '-'}</div>
                        <div style="text-align:right; margin-top:8px; font-weight:bold; color:var(--primary-dark);">
                            Total: Rp ${Number(o.total).toLocaleString('id-ID')}
                        </div>
                    </div>
                `;
            });
        }

        $('#userHistoryList').html(html);
        $('#historyModal').addClass('show');
    });

    $('#historyModalClose, .history-modal-overlay').click(function () {
        $('#historyModal').removeClass('show');
    });

    /* =====================================================
       FILTER NAVBAR & BUTTONS
       ===================================================== */
    $('.nav-link').click(function (e) {
        e.preventDefault();
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
        currentFilter = $(this).data('filter');
        $('.filter-btn').removeClass('active');
        $(`.filter-btn[data-cat="${currentFilter}"]`).addClass('active');
        renderProduk();

        const target = $(this).attr('href');
        if (target && target !== '#') {
            $('html, body').animate({ scrollTop: $(target).offset().top - 80 }, 500);
        }

        if (window.innerWidth <= 768) {
            $('#navMenu').removeClass('show');
            $('#hamburger i').removeClass('fa-times').addClass('fa-bars');
        }
    });

    $('.filter-btn').click(function () {
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');
        currentFilter = $(this).data('cat');
        $('.nav-link').removeClass('active');

        const navLink = $(`.nav-link[data-filter="${currentFilter}"]`);
        if (navLink.length) navLink.addClass('active');
        else $('.nav-link[data-filter="all"]').addClass('active');

        renderProduk();
    });

    $('#searchProduk').on('input', function () {
        searchKeyword = $(this).val();
        renderProduk();
    });

    /* =====================================================
       DETAIL MODAL BUNGA
       ===================================================== */
    $(document).on('click', '.produk-card', function () {
        const id = Number($(this).data('id'));
        const products = getStoredProducts();
        const produk = products.find(p => p.id === id);
        if (!produk) return;

        $('#modalFlowerImage').attr('src', getImagePath(produk.gambar)).attr('alt', produk.nama);
        $('#modalFlowerName').text(produk.nama);
        $('#modalFlowerDescription').text(produk.desc);
        $('#modalFlowerPrice').text('Rp ' + Number(produk.harga).toLocaleString('id-ID'));
        $('#modalFlowerCategory').text(produk.kategori);
        $('#modalAddCart').data('id', produk.id);

        $('#flowerModal').addClass('show');
        $('body').css('overflow', 'hidden');
    });

    function closeFlowerModal() {
        $('#flowerModal').removeClass('show');
        $('body').css('overflow', '');
    }

    $('#flowerModalClose, .flower-modal-overlay').click(closeFlowerModal);

    /* =====================================================
       SHOPPING CART FUNCTIONS (LOGIN REQUIRED CHECK)
       ===================================================== */
    $(document).on('click', '.btn-add-cart', function (e) {
        e.stopPropagation();
        
        // Cek login terlebih dahulu
        if (!checkLoginRequired()) return;

        const id = Number($(this).data('id'));
        addToCart(id);

        $(this).css('transform', 'rotate(90deg) scale(1.3)');
        setTimeout(() => { $(this).css('transform', ''); }, 300);
    });

    function addToCart(id) {
        const products = getStoredProducts();
        const produk = products.find(p => p.id === id);
        if (!produk) return;

        const existing = cart.find(item => item.id === id);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ id: produk.id, nama: produk.nama, harga: produk.harga, gambar: produk.gambar, qty: 1 });
        }

        updateCartUI();
        $('#cartBadge').css('transform', 'scale(1.4)');
        setTimeout(() => { $('#cartBadge').css('transform', 'scale(1)'); }, 200);
        showToast(`🌷 ${produk.nama} ditambahkan ke keranjang!`);
    }

    function updateCartUI() {
        const $cartItems = $('#cartItems');
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
        const totalHarga = cart.reduce((sum, item) => sum + (item.harga * item.qty), 0);

        $('#cartBadge').text(totalQty);
        $('#cartTotal').text('Rp ' + totalHarga.toLocaleString('id-ID'));

        if (cart.length === 0) {
            $cartItems.html(`
                <div class="cart-empty">
                    <i class="fas fa-seedling"></i>
                    <p>Keranjang masih kosong</p>
                    <small>Yuk pilih bunga favoritmu!</small>
                </div>
            `);
            return;
        }

        let html = '';
        cart.forEach(item => {
            html += `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-icon">
                        <img src="${getImagePath(item.gambar)}" alt="${item.nama}">
                    </div>
                    <div class="cart-item-info">
                        <h5>${item.nama}</h5>
                        <div class="price">Rp ${(item.harga * item.qty).toLocaleString('id-ID')}</div>
                        <div class="qty-control">
                            <button type="button" class="qty-btn" data-action="minus" data-id="${item.id}">−</button>
                            <span class="qty-value">${item.qty}</span>
                            <button type="button" class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <button type="button" class="cart-item-remove" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });
        $cartItems.html(html);
    }

    $(document).on('click', '.qty-btn', function () {
        const action = $(this).data('action');
        const id = Number($(this).data('id'));
        const item = cart.find(i => i.id === id);
        if (!item) return;

        if (action === 'plus') item.qty += 1;
        if (action === 'minus') {
            item.qty -= 1;
            if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
        }
        updateCartUI();
    });

    $(document).on('click', '.cart-item-remove', function () {
        const id = Number($(this).data('id'));
        cart = cart.filter(i => i.id !== id);
        updateCartUI();
        showToast('Bunga dihapus dari keranjang');
    });

    $('#cartBtn').click(function () {
        if (!checkLoginRequired()) return;
        $('#cartSidebar').addClass('open');
        $('#cartOverlay').fadeIn(300);
    });

    $('#cartClose, #cartOverlay').click(function () {
        $('#cartSidebar').removeClass('open');
        $('#cartOverlay').fadeOut(300);
    });

    $('#modalAddCart').click(function () {
        if (!checkLoginRequired()) return;
        const id = Number($(this).data('id'));
        addToCart(id);
        closeFlowerModal();
    });

    /* =====================================================
       FORM CHECKOUT & PESANAN (PEMBAYARAN INCLUDED)
       ===================================================== */
    $('#btnCheckout').click(function () {
        if (!checkLoginRequired()) return;

        if (cart.length === 0) {
            showToast('Keranjang masih kosong!');
            return;
        }

        const totalHarga = cart.reduce((sum, item) => sum + (item.harga * item.qty), 0);
        $('#modalTotalPay').text('Rp ' + totalHarga.toLocaleString('id-ID'));

        if (currentUser) {
            $('#inputNama').val(currentUser.nama);
        }

        $('#cartSidebar').removeClass('open');
        $('#cartOverlay').fadeOut(300);
        $('#checkoutModal').addClass('show');
        $('body').css('overflow', 'hidden');
    });

    function closeCheckoutModal() {
        $('#checkoutModal').removeClass('show');
        $('body').css('overflow', '');
    }

    $('#checkoutModalClose, .checkout-modal-overlay').click(closeCheckoutModal);

    function validateNama() {
        const val = $('#inputNama').val().trim();
        const $group = $('#inputNama').closest('.form-group');
        if (val.length < 3) { $group.addClass('invalid'); return false; }
        else { $group.removeClass('invalid'); return true; }
    }

    function validateWhatsapp() {
        const val = $('#inputWhatsapp').val().trim();
        const $group = $('#inputWhatsapp').closest('.form-group');
        const phoneRegex = /^[0-9]{10,14}$/;
        if (!phoneRegex.test(val)) { $group.addClass('invalid'); return false; }
        else { $group.removeClass('invalid'); return true; }
    }

    function validateAlamat() {
        const val = $('#inputAlamat').val().trim();
        const $group = $('#inputAlamat').closest('.form-group');
        if (val.length < 10) { $group.addClass('invalid'); return false; }
        else { $group.removeClass('invalid'); return true; }
    }

    $('#inputNama').on('input', validateNama);
    $('#inputWhatsapp').on('input', validateWhatsapp);
    $('#inputAlamat').on('input', validateAlamat);

    $('#formCheckout').on('submit', function (e) {
        e.preventDefault();
        if (!validateNama() || !validateWhatsapp() || !validateAlamat()) {
            showToast('Harap isi form dengan benar!');
            return;
        }

        const nama = $('#inputNama').val().trim();
        const whatsapp = $('#inputWhatsapp').val().trim();
        const alamat = $('#inputAlamat').val().trim();
        const metode = $('input[name="metodePengambilan"]:checked').val();
        const pembayaran = $('#inputPembayaran').val();
        const catatan = $('#inputCatatan').val().trim();
        const totalHarga = cart.reduce((sum, item) => sum + (item.harga * item.qty), 0);
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

        const $btn = $('#btnSubmitCheckout');
        $btn.html('<i class="fas fa-spinner fa-spin"></i> Memproses...').prop('disabled', true);

        setTimeout(function () {
            const orders = getStoredOrders();
            const orderId = 'BLM-' + Math.floor(1000 + Math.random() * 9000);
            const now = new Date();
            const waktuStr = now.toLocaleDateString('id-ID') + ' ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

            orders.unshift({
                id: orderId,
                username: currentUser ? currentUser.username : 'guest',
                nama, whatsapp, alamat, metode, pembayaran, catatan,
                items: [...cart],
                total: totalHarga,
                status: 'Menunggu',
                waktu: waktuStr
            });

            saveStoredOrders(orders);

            cart = [];
            updateCartUI();
            $('#formCheckout')[0].reset();
            $('.form-group').removeClass('invalid');
            $btn.html('<i class="fas fa-paper-plane"></i> Konfirmasi Pesanan').prop('disabled', false);

            closeCheckoutModal();

            $('#successMessage').html(
                `Terima kasih <strong>${nama}</strong>! Pesanan (Kode: <strong>#${orderId}</strong>) sebanyak <strong>${totalQty} bouquet</strong> total <strong>Rp ${totalHarga.toLocaleString('id-ID')}</strong> dengan pembayaran <strong>${pembayaran}</strong> telah tersimpan.`
            );
            $('#successModal').addClass('show');
            $('body').css('overflow', 'hidden');
        }, 1200);
    });

    $('#btnSuccessClose, .success-modal-overlay').click(function () {
        $('#successModal').removeClass('show');
        $('body').css('overflow', '');
        showToast('Pesanan berhasil diproses!');
    });

    /* =====================================================
       GENERAL UTILITIES
       ===================================================== */
    let toastTimer;
    function showToast(message) {
        clearTimeout(toastTimer);
        $('#toastMsg').text(message);
        $('#toast').addClass('show');
        toastTimer = setTimeout(() => { $('#toast').removeClass('show'); }, 2500);
    }

    $('#hamburger').click(function () {
        $('#navMenu').toggleClass('show');
        const icon = $(this).find('i');
        if ($('#navMenu').hasClass('show')) {
            icon.removeClass('fa-bars').addClass('fa-times');
        } else {
            icon.removeClass('fa-times').addClass('fa-bars');
        }
    });

    $(document).on('mousemove', function (e) {
        if (Math.random() > 0.35) return;
        const flowers = ['🌸', '🌷', '🌹', '🌺', '💮', '❀'];
        const flower = flowers[Math.floor(Math.random() * flowers.length)];
        const $flower = $('<span class="mouse-flower"></span>');

        $flower.text(flower);
        $flower.css({
            left: e.clientX + 'px',
            top: e.clientY + 'px',
            fontSize: (16 + Math.random() * 12) + 'px'
        });

        $('body').append($flower);
        setTimeout(() => { $flower.remove(); }, 1200);
    });

    $(document).keydown(function (e) {
        if (e.key === 'Escape') {
            closeFlowerModal();
            closeCheckoutModal();
            $('#authModal').removeClass('show');
            $('#historyModal').removeClass('show');
        }
    });

    /* =====================================================
       INITIALIZATION
       ===================================================== */
    renderProduk();
    updateCartUI();
    updateAuthUI();

    console.log('Bloomé - Final Responsive Site Ready');
});