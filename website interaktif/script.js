$(function(){

const skillBaru=['Bootstrap','PHP','MySQL','Git','React'];
let idxSkill=0;
const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

$('#btnShowName').click(function(){
$('#nameForm').slideToggle(300);
$('#jobForm').slideUp(300);
$('#errNewName').hide();
});

$('#btnShowJob').click(function(){
$('#jobForm').slideToggle(300);
$('#nameForm').slideUp(300);
$('#errNewJob').hide();
});

$('#btnGantiNama').click(function(){
const nama=$('#newName').val().trim();

if(nama.length<3){
$('#errNewName').fadeIn(200);
$('#newName').addClass('invalid').focus();
return;
}

$('#errNewName').hide();
$('#newName').removeClass('invalid');

$('#profileName').fadeOut(200,function(){
$(this).text(nama).css('color','#9a5876').fadeIn(300);
});

$('#newName').val('');
$('#nameForm').slideUp(300);
});

$('#btnGantiJob').click(function(){
const pekerjaan=$('#newJob').val().trim();

if(pekerjaan.length<3){
$('#errNewJob').fadeIn(200);
$('#newJob').addClass('invalid').focus();
return;
}

$('#errNewJob').hide();
$('#newJob').removeClass('invalid');

$('#profileJob').fadeOut(200,function(){
$(this).text(pekerjaan).css('color','#9a5876').fadeIn(300);
});

$('#newJob').val('');
$('#jobForm').slideUp(300);
});

$('#btnSkill').click(function(){
if(idxSkill<skillBaru.length){
$('<span class="skill"></span>')
.text(skillBaru[idxSkill++])
.hide()
.appendTo('#skills')
.fadeIn(400);
}else{
alert('Semua skill sudah ditambahkan!');
}
});

$('#btnAnimasi').click(function(){
$('#profileCard')
.stop(true,true)
.fadeOut(250)
.fadeIn(450)
.slideUp(250)
.slideDown(400);
});

$('#btnReset').click(function(){
$('#profileName').text('Novi Aulia').css('color','');
$('#profileJob').text('Web Developer & jQuery Enthusiast').css('color','');
$('#newName,#newJob').val('').removeClass('invalid');
$('#nameForm,#jobForm').slideUp(300);
$('#errNewName,#errNewJob').hide();
$('#skills .skill').slice(4).remove();
idxSkill=0;
});

function cek(input,err,kondisi){
if(kondisi){
err.hide();
input.removeClass('invalid');
return true;
}
err.show();
input.addClass('invalid');
return false;
}

const vNama=()=>cek($('#nama'),$('#errNama'),$('#nama').val().trim().length>=3);
const vEmail=()=>cek($('#email'),$('#errEmail'),emailRegex.test($('#email').val().trim()));
const vPesan=()=>cek($('#pesan'),$('#errPesan'),$('#pesan').val().trim().length>=10);

$('#nama').on('input',vNama);
$('#email').on('input',vEmail);
$('#pesan').on('input',vPesan);

$('#contactForm').submit(function(e){
e.preventDefault();

if([vNama(),vEmail(),vPesan()].every(Boolean)){
$('#successMessage').stop(true,true).fadeIn(300).delay(2000).fadeOut(300);
this.reset();
$('.invalid').removeClass('invalid');
}
});

$('#btnResetForm').click(function(){
$('#contactForm')[0].reset();
$('#contactForm .err').hide();
$('#contactForm .invalid').removeClass('invalid');
$('#successMessage').hide();
});

$('.card').on('mousemove',function(e){
const card=$(this);
const o=card.offset();
const x=e.pageX-o.left;
const y=e.pageY-o.top;
const ry=((x/card.outerWidth())-.5)*5;
const rx=((y/card.outerHeight())-.5)*-5;

card.css('transform','perspective(700px) rotateX('+rx+'deg) rotateY('+ry+'deg) translateY(-2px)');
});

$('.card').on('mouseleave',function(){
$(this).css('transform','perspective(700px) rotateX(0) rotateY(0) translateY(0)');
});

$(document).on('mousemove',function(e){

$('.mouse-light').css({
left:e.clientX,
top:e.clientY
});

$('.butterfly').css({
left:e.clientX+35,
top:e.clientY-25
});

});

$('#btnToko').click(function(){
window.location.href='../groceries/index.html';
});

});