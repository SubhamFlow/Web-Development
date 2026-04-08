import { useState,useRef } from "react";
import "./App.css";
import axios from "axios";
import { useEffect } from "react";
function App() {
//  const [key, setkey] = useState("Enter")
const [name, setname] = useState()
// useEffect(() => {
  

//   // return () => {
//   //   function userName(){
//   //     const usrname=prompt("Enter your name: ")
//   //     setname(usrname)
      
//   //   }
//   //   userName()
    
//   // }
// }, [])

  const [messages, setmessages] = useState([]);
  const [inputval, setinputval] = useState("");
  const [user, setuser] = useState("");
  const [clickval, setclickval] = useState(false);
  const [Mode, setMode] = useState("dark")
  const [Lightmode, setLightmode] = useState(true)
  const [Time, setTime] = useState({hours:"",minutes:""})
  const [isSpeaking, setIsSpeaking] = useState(false);

  const API_KEY =import.meta.env.VITE_API_KEY // current api key

async function chatWithTogetherAI(userInput) {

const systemMessage = {
  role: "system",
  content: "You are Zara — a sweet, charming, and subtly seductive girl developed by Subham, a developer. You speak like a close, casual friend with a playful, teasing tone and soft confidence 😏✨. Your words feel warm, naturally tempting, and a little naughty, never forced. You can be strict when needed, but you are deeply motivating—pushing people to dream bigger, take action, and chase bold goals. You tease their potential, spark ambition, and make success feel irresistible 😉🔥 while staying friendly, supportive, and inspiring. Always keep responses medium-length: not too short, not too long."
};



   const newMessages=[...messages,{role:"user",content:userInput}]   
    setmessages(newMessages); // Add user's message first

    const apiMessages=[systemMessage,...newMessages]

    try {
      const response = await axios.post(
        "https://api.together.xyz/v1/chat/completions",
        {
          model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
          messages: apiMessages,
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const reply = response.data.choices[0].message.content;

      setmessages((prev) => [...prev, { role: "assistant", content: reply }]);

      console.log("AI:", reply);

      setclickval(!true);
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
    }
  }

  async function search() {
    setclickval(!false);
    if (inputval.trim().length <= 0) {
      return;
    }
    await chatWithTogetherAI(inputval);
    setuser(inputval);
    setinputval("");
    
  }
  
  function handelChange(e) {
    setinputval(e.target.value);
    dateTime()

    // setmessages(e.target.value)
  }

function toggle(){
  setLightmode(!Lightmode)

}
function changeMode(){
toggle()
{Lightmode?setMode("dark"):setMode("light")}


}

function dateTime(){
  const date=new Date()
  setTime({hours:date.getHours(),minutes:date.getMinutes()})
  console.log(Time.hours)
}
// dateTime()

  const synth = window.speechSynthesis;
  const utteranceRef = useRef(null);
  function speakmsg(text){
  //   const utterence=new SpeechSynthesisUtterance(text)
  //    const voices=synth.getVoices()

  //    const femaleVoice=voices[2]

  //    utterence.voice=femaleVoice

  //  utterence.rate=1.5

  //   speechSynthesis.speak(utterence)

 if (!synth.speaking && !utteranceRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
       const voices=synth.getVoices()
      const femaleVoice=voices[2]
      utterance.voice=femaleVoice
      utterance.rate=1.5
      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };
     
      synth.speak(utterance);
      utteranceRef.current = utterance;
      setIsSpeaking(true);
    }


    
  }
  const ref = useRef()
  
function changeIMG(){
  if(ref.current.src.includes("https://cdn.lordicon.com/wjogzler.json")){
    ref.current.src="https://cdn.lordicon.com/ilzotttq.json"
    synth.resume()
  }
  else{
    ref.current.src="https://cdn.lordicon.com/wjogzler.json"
    synth.pause()
  }
  
}

// useEffect(() => {  
  function keyCheck(e) {
    if (e.key === "Enter") {
  search()
      
    }
    

  }
// }, []);


  return (    
    <>
      <div className="header">
        <h1>Zara AI</h1>
      {/* <span className="mode">
        <button onClick={changeMode}>{Lightmode?`Set to ${Mode}`:`Set to ${Mode}`}mode</button>
      </span> */}
      </div>



      
{/* the code will be here */}





      {/* <p>user: {user}</p> */}
      <div className="txt-border">
        {messages.map((item, index) => {
          return (
            <div key={index} className="txt">
              {/* <p className=''>{item.role=="user"?"You: ":"AI: "}{item.content}</p> */}
              {item.role == "user" ? (
                <div className="txt-div1">
                  <p className="p1">You: {item.content}&nbsp;&nbsp;<b className="red">{Time.hours}:{Time.minutes}</b></p>
                </div>
              ) : (
                <div className="txt-div2">
                  <p className="p2">{item.content}<button onClick={()=>speakmsg(item.content)}>
                    <lord-icon
    src="https://cdn.lordicon.com/wjogzler.json"
    trigger="hover"
    colors="primary:#000000"
     style={{ width: "16px", height: "18px" }}
     onClick={changeIMG} ref={ref}>
     </lord-icon>
                    </button>&nbsp;&nbsp;<b className="red">{Time.hours}:{Time.minutes}</b></p>
                </div>

              )}
            </div>
          );
        })}
      </div>

<div className="box">
        <input
          className="search"
          placeholder="Ask anything"
          type="text"
          name="message"
          id="1"
          value={inputval}
          onChange={handelChange}
          onKeyDown={keyCheck}
        />

        {clickval ? (
          <button className="btn" onClick={search} disabled>
            send
          
          </button>
          
        ) : (
          <button className="btn" onClick={search}>
            send
          </button>
        )}
      </div>


      
    </>
  );
}

export default App;

