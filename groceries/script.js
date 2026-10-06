$(function(){

const produk=[
{id:1,nama:'Mawar Pink',harga:35000,ikon:'🌷',deskripsi:'Bunga mawar pink dengan warna lembut untuk hadiah spesial.'},
{id:2,nama:'Mawar Merah',harga:40000,ikon:'🌹',deskripsi:'Mawar merah yang cocok untuk memberikan kesan romantis.'},
{id:3,nama:'Tulip Pink',harga:45000,ikon:'🌷',deskripsi:'Tulip pink dengan tampilan sederhana dan elegan.'},
{id:4,nama:'Tulip Ungu',harga:45000,ikon:'💜',deskripsi:'Tulip ungu dengan warna lembut untuk berbagai kesempatan.'},
{id:5,nama:'Lily Putih',harga:50000,ikon:'🌸',deskripsi:'Lily putih dengan tampilan bersih dan anggun.'},
{id:6,nama:'Sunflower',harga:40000,ikon:'🌻',deskripsi:'Bunga matahari cerah untuk memberikan suasana yang lebih ceria.'},
{id:7,nama:"Baby's Breath",harga:30000,ikon:'🌼',deskripsi:'Bunga kecil yang cocok sebagai pelengkap buket.'},
{id:8,nama:'Buket Pastel',harga:75000,ikon:'💐',deskripsi:'Buket dengan perpaduan warna pastel yang lembut dan cantik.'},
{id:9,nama:'Buket Romantic',harga:85000,ikon:'🌹',deskripsi:'Buket romantis dengan perpaduan bunga bernuansa pink dan merah.'},
{id:10,nama:'Buket Mix Flower',harga:100000,ikon:'💐',deskripsi:'Buket campuran berbagai bunga untuk hadiah spesial.'}
];

let cart=[];
let totalAkhir=0;

function rupiah(n){
return 'Rp '+n.toLocaleString('id-ID');
}

$('#btnKembali').click(function(){
window.location.href='../website interaktif/index.html';
});

produk.forEach(function(p){

$('#productList').append(`
<div class="produk-item">

<div class="produk-gambar">
${p.ikon}
</div>

<h3>${p.nama}</h3>

<div class="deskripsi">
${p.deskripsi}
</div>

<div class="harga">
${rupiah(p.harga)}
</div>

<button class="btnTambah" data-id="${p.id}">
Tambah ke Keranjang
</button>

</div>
`);

});

$(document).on('click','.btnTambah',function(){

const id=Number($(this).data('id'));

const p=produk.find(function(item){
return item.id===id;
});

const item=cart.find(function(item){
return item.id===id;
});

if(item){
item.qty++;
}else{
cart.push({...p,qty:1});
}

updateCartUI();

});

function updateCartUI(){

$('#cartList').html('');

let totalHarga=cart.reduce(function(sum,item){
return sum+(item.harga*item.qty);
},0);

if(cart.length===0){

$('#cartList')
.text('Keranjang masih kosong.')
.addClass('cart-empty');

$('#cartTotal').text('Total: Rp 0');

totalAkhir=0;

return;

}

$('#cartList').removeClass('cart-empty');

cart.forEach(function(item){

$('#cartList').append(`
<div class="cart-item">

<span>
${item.ikon} ${item.nama} x ${item.qty}
</span>

<span>
${rupiah(item.harga*item.qty)}
</span>

</div>
`);

});

if(totalHarga>100000){

const diskon=totalHarga*0.1;

totalAkhir=totalHarga-diskon;

$('#cartTotal').html(`
Subtotal: ${rupiah(totalHarga)}<br>
Diskon 10%: -${rupiah(diskon)}<br>
Total: ${rupiah(totalAkhir)}
`);

}else{

totalAkhir=totalHarga;

$('#cartTotal').text(
'Total: '+rupiah(totalHarga)
);

}

}

function simpanRiwayat(total,qty){

const riwayat=
JSON.parse(localStorage.getItem('riwayat'))||[];

riwayat.push({
tanggal:new Date().toISOString(),
total:total,
qty:qty
});

localStorage.setItem(
'riwayat',
JSON.stringify(riwayat)
);

tampilkanRiwayat();

}

function tampilkanRiwayat(){

const riwayat=
JSON.parse(localStorage.getItem('riwayat'))||[];

if(!riwayat.length){

$('#historyList')
.text('Belum ada riwayat pembelian.');

return;

}

$('#historyList').html('');

riwayat.forEach(function(r,i){

$('#historyList').append(`
<div class="history-item">

Pembelian ${i+1}<br>

Tanggal:
${new Date(r.tanggal).toLocaleString('id-ID')}<br>

Jumlah:
${r.qty} barang<br>

Total:
${rupiah(r.total)}

</div>
`);

});

}

$('#btnCheckout').click(function(){

if(!cart.length){

alert('Keranjang masih kosong.');

return;

}

$('.err').hide();

$('#buyerName,#buyerAddress,#buyerPhone')
.removeClass('invalid');

$('#buyerModal').fadeIn(200);

});

$('#btnClose').click(function(){

$('#buyerModal').fadeOut(200);

});

$('#btnConfirm').click(function(){

const nama=$('#buyerName').val().trim();

const alamat=$('#buyerAddress').val().trim();

const hp=$('#buyerPhone').val().trim();

let valid=true;

$('.err').hide();

$('#buyerName,#buyerAddress,#buyerPhone')
.removeClass('invalid');

if(nama.length<3){

$('#errBuyerName').show();

$('#buyerName').addClass('invalid');

valid=false;

}

if(alamat.length<10){

$('#errBuyerAddress').show();

$('#buyerAddress').addClass('invalid');

valid=false;

}

if(!/^08[0-9]{8,13}$/.test(hp)){

$('#errBuyerPhone').show();

$('#buyerPhone').addClass('invalid');

valid=false;

}

if(!valid){

return;

}

const qty=cart.reduce(function(sum,item){

return sum+item.qty;

},0);

simpanRiwayat(totalAkhir,qty);

alert(
'Checkout berhasil. Terima kasih, '+nama+'!'
);

cart=[];

updateCartUI();

$('#buyerModal').fadeOut(200);

$('#buyerName,#buyerAddress,#buyerPhone')
.val('');

});

$(document).on('mousemove',function(e){

$('.mouse-light').css({
left:e.clientX,
top:e.clientY
});

$('.butterfly').css({
left:e.clientX+45,
top:e.clientY-30
});

});

tampilkanRiwayat();

updateCartUI();

});