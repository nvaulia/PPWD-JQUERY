/* =========================================================
   BLOOMÉ FLOWERS SHOP
   by Novi Aulia
   ========================================================= */

$(document).ready(function () {


    /* =====================================================
       DATA PRODUK
       ===================================================== */

    const produkData = [

        {
            id: 1,
            nama: 'Pink Lily',
            harga: 35000,
            kategori: 'lily',
            gambar: 'pinklily.jpg',
            desc: 'Lily pink segar dengan kelopak lembut.',
            badge: 'Favorit',
            badgeType: ''
        },

        {
            id: 2,
            nama: 'White Lily',
            harga: 38000,
            kategori: 'lily',
            gambar: 'whitelily.jpg',
            desc: 'Lily putih dengan tampilan bersih dan elegan.',
            badge: '',
            badgeType: ''
        },

        {
            id: 3,
            nama: 'Stargazer Lily',
            harga: 45000,
            kategori: 'lily',
            gambar: 'stargizerlily.jpg',
            desc: 'Lily pink dengan corak dan bintik khas.',
            badge: 'Best Seller',
            badgeType: 'hot'
        },

        {
            id: 4,
            nama: 'Oriental Lily',
            harga: 48000,
            kategori: 'lily',
            gambar: 'orientallily.jpg',
            desc: 'Lily berukuran besar dengan aroma harum.',
            badge: '',
            badgeType: ''
        },

        {
            id: 5,
            nama: 'Casablanca Lily',
            harga: 50000,
            kategori: 'lily',
            gambar: 'casablancalily.jpg',
            desc: 'Lily putih elegan untuk hadiah spesial.',
            badge: 'Premium',
            badgeType: ''
        },

        {
            id: 6,
            nama: 'Pink Rose',
            harga: 30000,
            kategori: 'rose',
            gambar: 'pinkrose.jpg',
            desc: 'Mawar pink segar dengan warna lembut.',
            badge: 'Favorit',
            badgeType: ''
        },

        {
            id: 7,
            nama: 'Red Rose',
            harga: 35000,
            kategori: 'rose',
            gambar: 'redrose.jpg',
            desc: 'Mawar merah klasik untuk berbagai momen.',
            badge: 'Best Seller',
            badgeType: 'hot'
        },

        {
            id: 8,
            nama: 'Peach Rose',
            harga: 38000,
            kategori: 'rose',
            gambar: 'peachrose.jpg',
            desc: 'Mawar peach dengan warna hangat dan lembut.',
            badge: 'New',
            badgeType: ''
        },

        {
            id: 9,
            nama: 'Pink Tulip',
            harga: 40000,
            kategori: 'tulip',
            gambar: 'pinktulip.jpg',
            desc: 'Tulip pink dengan bentuk kelopak yang cantik.',
            badge: 'Favorit',
            badgeType: ''
        },

        {
            id: 10,
            nama: 'White Tulip',
            harga: 42000,
            kategori: 'tulip',
            gambar: 'whitetulip.jpg',
            desc: 'Tulip putih dengan tampilan minimalis.',
            badge: '',
            badgeType: ''
        },

        {
            id: 11,
            nama: 'Pink Peony',
            harga: 55000,
            kategori: 'peony',
            gambar: 'pinkpeony.jpg',
            desc: 'Peony pink dengan kelopak yang penuh dan lembut.',
            badge: 'Premium',
            badgeType: ''
        },

        {
            id: 12,
            nama: 'Pink Hydrangea',
            harga: 45000,
            kategori: 'other',
            gambar: 'pinkhydrengea.jpg',
            desc: 'Hydrangea pink dengan kumpulan bunga yang cantik.',
            badge: 'New',
            badgeType: ''
        },

        {
            id: 13,
            nama: "Baby's Breath",
            harga: 25000,
            kategori: 'other',
            gambar: 'babybreath.jpg',
            desc: 'Bunga kecil putih untuk pelengkap rangkaian.',
            badge: '',
            badgeType: ''
        },

        {
            id: 14,
            nama: 'Sunflower',
            harga: 30000,
            kategori: 'other',
            gambar: 'sunflower.jpg',
            desc: 'Bunga matahari cerah dengan warna kuning khas.',
            badge: 'Popular',
            badgeType: ''
        }

    ];


    /* =====================================================
       STATE
       ===================================================== */

    let cart = [];

    let currentFilter = 'all';

    let searchKeyword = '';


    /* =====================================================
       FUNGSI PATH GAMBAR
       ===================================================== */

    function getImagePath(namaFile) {

        return '../pictures/' + namaFile;

    }


    /* =====================================================
       RENDER PRODUK
       ===================================================== */

    function renderProduk() {

        const $grid = $('#produkGrid');

        $grid.empty();


        const filtered = produkData.filter(function (p) {

            const matchKategori =
                currentFilter === 'all' ||
                p.kategori === currentFilter;


            const keyword =
                searchKeyword.toLowerCase();


            const matchSearch =
                p.nama
                    .toLowerCase()
                    .includes(keyword) ||

                p.desc
                    .toLowerCase()
                    .includes(keyword);


            return matchKategori && matchSearch;

        });


        if (filtered.length === 0) {

            $grid.html(`

                <div class="no-product">

                    <i class="fas fa-seedling"></i>

                    <h3>
                        Bunga tidak ditemukan
                    </h3>

                    <p>
                        Coba kata kunci atau kategori lain.
                    </p>

                </div>

            `);

            return;

        }


        filtered.forEach(function (p) {

            const badgeHtml = p.badge

                ? `
                    <div class="produk-badge ${p.badgeType}">
                        ${p.badge}
                    </div>
                `

                : '';


            const card = `

                <div
                    class="produk-card"
                    data-id="${p.id}"
                >

                    ${badgeHtml}


                    <div class="produk-img">

                        <img
                            src="${getImagePath(p.gambar)}"
                            alt="${p.nama}"
                        >

                    </div>


                    <div class="produk-info">

                        <h3>
                            ${p.nama}
                        </h3>


                        <p class="desc">
                            ${p.desc}
                        </p>


                        <div class="produk-footer">

                            <div class="produk-price">

                                Rp ${p.harga.toLocaleString('id-ID')}

                                <small>
                                    per bouquet
                                </small>

                            </div>


                            <button
                                type="button"
                                class="btn-add-cart"
                                data-id="${p.id}"
                                title="Tambah ke keranjang"
                            >

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
       FILTER NAVBAR
       ===================================================== */

    $('.nav-link').click(function (e) {

        e.preventDefault();


        $('.nav-link')
            .removeClass('active');


        $(this)
            .addClass('active');


        currentFilter =
            $(this).data('filter');


        $('.filter-btn')
            .removeClass('active');


        $(
            `.filter-btn[data-cat="${currentFilter}"]`
        ).addClass('active');


        renderProduk();


        const target =
            $(this).attr('href');


        if (target && target !== '#') {

            $('html, body').animate({

                scrollTop:
                    $(target).offset().top - 80

            }, 500);

        }


        if (window.innerWidth <= 768) {

            $('#navMenu')
                .removeClass('show');


            $('#hamburger i')
                .removeClass('fa-times')
                .addClass('fa-bars');

        }

    });


    /* =====================================================
       FILTER BUTTON
       ===================================================== */

    $('.filter-btn').click(function () {

        $('.filter-btn')
            .removeClass('active');


        $(this)
            .addClass('active');


        currentFilter =
            $(this).data('cat');


        $('.nav-link')
            .removeClass('active');


        const navLink =
            $(
                `.nav-link[data-filter="${currentFilter}"]`
            );


        if (navLink.length) {

            navLink.addClass('active');

        } else {

            $(
                '.nav-link[data-filter="all"]'
            ).addClass('active');

        }


        renderProduk();

    });


    /* =====================================================
       SEARCH
       ===================================================== */

    $('#searchProduk').on(
        'input',
        function () {

            searchKeyword =
                $(this).val();


            renderProduk();

        }
    );


    /* =====================================================
       DETAIL CARD BUNGA
       ===================================================== */

    $(document).on(
        'click',
        '.produk-card',
        function () {

            const id =
                Number(
                    $(this).data('id')
                );


            const produk =
                produkData.find(
                    function (p) {

                        return p.id === id;

                    }
                );


            if (!produk) {

                return;

            }


            $('#modalFlowerImage')
                .attr(
                    'src',
                    getImagePath(produk.gambar)
                )
                .attr(
                    'alt',
                    produk.nama
                );


            $('#modalFlowerName')
                .text(
                    produk.nama
                );


            $('#modalFlowerDescription')
                .text(
                    produk.desc
                );


            $('#modalFlowerPrice')
                .text(
                    'Rp ' +
                    produk.harga
                        .toLocaleString('id-ID')
                );


            $('#modalFlowerCategory')
                .text(
                    produk.kategori
                );


            $('#modalAddCart')
                .data(
                    'id',
                    produk.id
                );


            $('#flowerModal')
                .addClass('show');


            $('body')
                .css(
                    'overflow',
                    'hidden'
                );

        }
    );


    /* =====================================================
       TAMBAH KE KERANJANG
       ===================================================== */

    $(document).on(
        'click',
        '.btn-add-cart',
        function (e) {

            e.stopPropagation();


            const id =
                Number(
                    $(this).data('id')
                );


            addToCart(id);


            $(this).css(
                'transform',
                'rotate(90deg) scale(1.3)'
            );


            setTimeout(
                function () {

                    $(this).css(
                        'transform',
                        ''
                    );

                }.bind(this),
                300
            );

        }
    );


    /* =====================================================
       FUNCTION TAMBAH CART
       ===================================================== */

    function addToCart(id) {

        const produk =
            produkData.find(
                function (p) {

                    return p.id === id;

                }
            );


        if (!produk) {

            return;

        }


        const existing =
            cart.find(
                function (item) {

                    return item.id === id;

                }
            );


        if (existing) {

            existing.qty += 1;

        } else {

            cart.push({

                id: produk.id,

                nama: produk.nama,

                harga: produk.harga,

                gambar: produk.gambar,

                qty: 1

            });

        }


        updateCartUI();


        $('#cartBadge')
            .css(
                'transform',
                'scale(1.4)'
            );


        setTimeout(
            function () {

                $('#cartBadge')
                    .css(
                        'transform',
                        'scale(1)'
                    );

            },
            200
        );


        showToast(
            `🌷 ${produk.nama} ditambahkan ke keranjang!`
        );

    }


    /* =====================================================
       UPDATE CART
       ===================================================== */

    function updateCartUI() {

        const $cartItems =
            $('#cartItems');


        const totalQty =
            cart.reduce(
                function (sum, item) {

                    return sum + item.qty;

                },
                0
            );


        const totalHarga =
            cart.reduce(
                function (sum, item) {

                    return sum +
                        (
                            item.harga *
                            item.qty
                        );

                },
                0
            );


        $('#cartBadge')
            .text(totalQty);


        $('#cartTotal')
            .text(
                'Rp ' +
                totalHarga
                    .toLocaleString('id-ID')
            );


        if (cart.length === 0) {

            $cartItems.html(`

                <div class="cart-empty">

                    <i class="fas fa-seedling"></i>

                    <p>
                        Keranjang masih kosong
                    </p>

                    <small>
                        Yuk pilih bunga favoritmu!
                    </small>

                </div>

            `);

            return;

        }


        let html = '';


        cart.forEach(function (item) {

            html += `

                <div
                    class="cart-item"
                    data-id="${item.id}"
                >

                    <div class="cart-item-icon">

                        <img
                            src="${getImagePath(item.gambar)}"
                            alt="${item.nama}"
                        >

                    </div>


                    <div class="cart-item-info">

                        <h5>
                            ${item.nama}
                        </h5>


                        <div class="price">

                            Rp ${
                                (
                                    item.harga *
                                    item.qty
                                ).toLocaleString('id-ID')
                            }

                        </div>


                        <div class="qty-control">

                            <button
                                type="button"
                                class="qty-btn"
                                data-action="minus"
                                data-id="${item.id}"
                            >
                                −
                            </button>


                            <span class="qty-value">
                                ${item.qty}
                            </span>


                            <button
                                type="button"
                                class="qty-btn"
                                data-action="plus"
                                data-id="${item.id}"
                            >
                                +
                            </button>

                        </div>

                    </div>


                    <button
                        type="button"
                        class="cart-item-remove"
                        data-id="${item.id}"
                    >

                        <i class="fas fa-trash"></i>

                    </button>

                </div>

            `;

        });


        $cartItems.html(html);

    }


    /* =====================================================
       PLUS / MINUS CART
       ===================================================== */

    $(document).on(
        'click',
        '.qty-btn',
        function () {

            const action =
                $(this).data('action');


            const id =
                Number(
                    $(this).data('id')
                );


            const item =
                cart.find(
                    function (i) {

                        return i.id === id;

                    }
                );


            if (!item) {

                return;

            }


            if (action === 'plus') {

                item.qty += 1;

            }


            if (action === 'minus') {

                item.qty -= 1;


                if (item.qty <= 0) {

                    cart =
                        cart.filter(
                            function (i) {

                                return i.id !== id;

                            }
                        );

                }

            }


            updateCartUI();

        }
    );


    /* =====================================================
       HAPUS CART
       ===================================================== */

    $(document).on(
        'click',
        '.cart-item-remove',
        function () {

            const id =
                Number(
                    $(this).data('id')
                );


            cart =
                cart.filter(
                    function (i) {

                        return i.id !== id;

                    }
                );


            updateCartUI();


            showToast(
                'Bunga dihapus dari keranjang'
            );

        }
    );


    /* =====================================================
       BUKA CART
       ===================================================== */

    $('#cartBtn').click(function () {

        $('#cartSidebar')
            .addClass('open');


        $('#cartOverlay')
            .fadeIn(300);

    });


    /* =====================================================
       TUTUP CART
       ===================================================== */

    $('#cartClose, #cartOverlay')
        .click(function () {

            $('#cartSidebar')
                .removeClass('open');


            $('#cartOverlay')
                .fadeOut(300);

        });


    /* =====================================================
       MODAL CLOSE
       ===================================================== */

    function closeFlowerModal() {

        $('#flowerModal')
            .removeClass('show');


        $('body')
            .css(
                'overflow',
                ''
            );

    }


    $('#flowerModalClose')
        .click(function () {

            closeFlowerModal();

        });


    $('.flower-modal-overlay')
        .click(function () {

            closeFlowerModal();

        });


    /* =====================================================
       ESC UNTUK TUTUP MODAL
       ===================================================== */

    $(document).keydown(
        function (e) {

            if (
                e.key === 'Escape' &&
                $('#flowerModal')
                    .hasClass('show')
            ) {

                closeFlowerModal();

            }

        }
    );


    /* =====================================================
       TAMBAH DARI MODAL
       ===================================================== */

    $('#modalAddCart').click(
        function () {

            const id =
                Number(
                    $(this).data('id')
                );


            addToCart(id);


            closeFlowerModal();

        }
    );


    /* =====================================================
       CHECKOUT
       ===================================================== */

    $('#btnCheckout').click(
        function () {

            if (cart.length === 0) {

                showToast(
                    'Keranjang masih kosong!'
                );

                return;

            }


            const total =
                cart.reduce(
                    function (sum, item) {

                        return sum +
                            (
                                item.harga *
                                item.qty
                            );

                    },
                    0
                );


            const totalQty =
                cart.reduce(
                    function (sum, item) {

                        return sum + item.qty;

                    },
                    0
                );


            const $btn =
                $(this);


            $btn
                .html(
                    '<i class="fas fa-spinner fa-spin"></i> Memproses...'
                )
                .prop(
                    'disabled',
                    true
                );


            setTimeout(
                function () {

                    cart = [];


                    updateCartUI();


                    $('#cartSidebar')
                        .removeClass('open');


                    $('#cartOverlay')
                        .fadeOut(300);


                    $btn
                        .html(
                            '<i class="fas fa-check-circle"></i> Checkout Sekarang'
                        )
                        .prop(
                            'disabled',
                            false
                        );


                    showToast(
                        `Checkout berhasil! ${totalQty} item · Rp ${total.toLocaleString('id-ID')}`
                    );

                },
                1500
            );

        }
    );


    /* =====================================================
       TOAST
       ===================================================== */

    let toastTimer;


    function showToast(message) {

        clearTimeout(toastTimer);


        $('#toastMsg')
            .text(message);


        $('#toast')
            .addClass('show');


        toastTimer =
            setTimeout(
                function () {

                    $('#toast')
                        .removeClass('show');

                },
                2500
            );

    }


    /* =====================================================
       HAMBURGER
       ===================================================== */

    $('#hamburger').click(
        function () {

            $('#navMenu')
                .toggleClass('show');


            const icon =
                $(this).find('i');


            if (
                $('#navMenu')
                    .hasClass('show')
            ) {

                icon
                    .removeClass('fa-bars')
                    .addClass('fa-times');

            } else {

                icon
                    .removeClass('fa-times')
                    .addClass('fa-bars');

            }

        }
    );


    /* =====================================================
       EFEK BUNGA MENGIKUTI MOUSE
       ===================================================== */

    $(document).on(
        'mousemove',
        function (e) {

            if (Math.random() > 0.35) {

                return;

            }


            const flowers = [

                '🌸',
                '🌷',
                '🌹',
                '🌺',
                '💮',
                '❀'

            ];


            const flower =
                flowers[
                    Math.floor(
                        Math.random() *
                        flowers.length
                    )
                ];


            const $flower =
                $('<span class="mouse-flower"></span>');


            $flower.text(flower);


            $flower.css({

                left:
                    e.clientX + 'px',

                top:
                    e.clientY + 'px',

                fontSize:
                    (
                        16 +
                        Math.random() * 12
                    ) + 'px'

            });


            $('body')
                .append($flower);


            setTimeout(
                function () {

                    $flower.remove();

                },
                1200
            );

        }
    );


    /* =====================================================
       INITIALISASI
       ===================================================== */

    renderProduk();

    updateCartUI();


    console.log(
        'Bloomé - Flowers for Every Moment'
    );

    console.log(
        'by Novi Aulia'
    );

    console.log(
        'Total produk: ' +
        produkData.length
    );

});