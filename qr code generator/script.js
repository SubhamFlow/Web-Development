let ImgBox=document.getElementById("ImgBox")
let qrImg=document.getElementById("qrImg")
let qrtext=document.getElementById("qrtext")
let download=document.getElementById("download")

function generateQR(){

qrImg.src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data="+ qrtext.value

// ImgBox.classList.add("show-img")

}

download.href=qrImg.src  //download the file image
qrImg.onload=function(){
    
    download.style.display="block"
}
// generateQR()



