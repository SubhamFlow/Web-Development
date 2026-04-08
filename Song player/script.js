let val=document.getElementById("vol");
const audio=document.querySelector("audio");
// let btns=document.querySelector(".buttons");
const secondDiv = document.querySelector(".buttons div:nth-child(2)");
let ctrl=document.getElementById("ctrlIcon");
let forwd=document.getElementById("forward");
let backwd=document.getElementById("backward");

let img=document.querySelector("img");

let volImg=document.getElementById("volumeimg");

audio.addEventListener("loadedmetadata", () => {
    val.max = audio.duration;
    val.step="0.01";
});


audio.addEventListener('ended',()=>{
    ctrl.classList.remove("fa-pause")
    ctrl.classList.add("fa-play")
        secondDiv.style.backgroundColor=`rgb(36, 224, 121)`
})


// update the song 

val.addEventListener("input",()=>{
    audio.currentTime=val.value;
console.log(val.value);

})
const sound=document.querySelector("#sound")

sound.addEventListener("input",()=>{
    
    audio.volume=sound.value/100;
    console.log(sound.value);
    
    //audio volume
    if (sound.value == 0) {
        volImg.classList.remove("fa-volume-low", "fa-volume-high");
        volImg.classList.add("fa-volume-off");
      } else if (sound.value <= 55) {
        volImg.classList.remove("fa-volume-off", "fa-volume-high");
        volImg.classList.add("fa-volume-low");
      } else if (sound.value > 55) {
        volImg.classList.remove("fa-volume-off", "fa-volume-low");
        volImg.classList.add("fa-volume-high");
      }
      
})



ctrl.addEventListener("click",()=>{
    if(audio.paused){
        audio.play()
        ctrl.classList.remove("fa-play")
        ctrl.classList.add("fa-pause")
        secondDiv.style.background="white"
        
        
    }
    else{
        audio.pause()
        ctrl.classList.add("fa-play")
        ctrl.classList.remove("fa-pause")
        secondDiv.style.backgroundColor=`rgb(36, 224, 121)`
        
    }
    setInterval(() => {
        val.value=audio.currentTime
       
    }, 500);
})
   

const songs=[
    {
        audiosrc:"second.mp3",
        imagesrc:"second.jpg"
    },
{
    audiosrc:"third.mp3",
    imagesrc:"third.jpg"
},

{
    audiosrc:"fourth.mp3",
    imagesrc:"fourth.jpg"
},
{
    audiosrc:"fifth.mp3",
    imagesrc:"fifth.jpg"
},

]
let currentsongindex=0;
function loadsong(index){
const song=songs[index];

    audio.src=song.audiosrc;
    img.src=song.imagesrc;
    ctrl.classList.add("fa-pause")
    ctrl.classList.remove("fa-play");
    secondDiv.style.background="white"
    audio.play();
    setInterval(() => {
        val.value=audio.currentTime
    }, 500);
}

forwd.addEventListener("click",()=>{
currentsongindex=(currentsongindex+1) % songs.length;
loadsong(currentsongindex);
})

backwd.addEventListener("click",()=>{

  currentsongindex=(currentsongindex+1) % songs.length;
loadsong(currentsongindex);
})


let songduration=document.querySelector('p');

function timeupdate(t){
let min=Math.floor(t/60);
let sec=Math.floor(t%60);
return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
setInterval(() => {
    // val.value = audio.currentTime;
    songduration.textContent = `${timeupdate(audio.currentTime)}/${timeupdate(audio.duration)}`;

}, 500);


// audio.src="second.mp3";
// img.src="second.jpg";
// ctrl.classList.add("fa-pause")
// ctrl.classList.remove("fa-play");
//     secondDiv.style.background="white"
// audio.play();
// setInterval(() => {
//     val.value=audio.currentTime

// }, 500);
