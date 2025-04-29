let gameMode = sessionStorage.getItem("gamemode");
let gameDifficulty = sessionStorage.getItem("gamedifficulty");

const wordInBox = document.querySelectorAll(".word-button > .word");
const answerBox = document.querySelectorAll(".question-box > .word-answer");
const meaningInBox = document.getElementsByClassName("meaning");
const checkButton = document.getElementById("chkBtn");
const clearAllButton = document.getElementById("clrBtn");

// Display game mode
switch(gameMode){
    case "Adventure":
        document.getElementsByClassName("gamemode")[0].innerHTML = "โหมดผจญภัย";
        break;
    case "Practice":
        document.getElementsByClassName("gamemode")[0].innerHTML = "โหมดฝึกฝน";
        break;
    default: document.getElementsByClassName("gamemode")[0].innerHTML = gameMode;
}

// Calculate score multiplier following by game difficulty
let multiplier = 1.0;
switch(gameDifficulty){
    case "1":
        document.getElementsByClassName("gamedifficulty")[0].innerHTML = "ความยาก: พื้นฐาน";
        multiplier = 1.0;
        break;
    case "2":
        document.getElementsByClassName("gamedifficulty")[0].innerHTML = "ความยาก: ง่าย";
        multiplier = 1.2;
        break;
    case "3":
        document.getElementsByClassName("gamedifficulty")[0].innerHTML = "ความยาก: ปานกลาง";
        multiplier = 1.4;
        break;
    case "4":
        document.getElementsByClassName("gamedifficulty")[0].innerHTML = "ความยาก: ยาก";
        multiplier = 1.6;
        break;
    case "5":
        document.getElementsByClassName("gamedifficulty")[0].innerHTML = "ความยาก: ขั้นสูง";
        multiplier = 1.8;
        break;
    case "6":
        document.getElementsByClassName("gamedifficulty")[0].innerHTML = "ความยาก: ผู้เชี่ยวชาญ";
        multiplier = 2.0;
        break;
    default: multiplier = 1.0;
}

isTimeOut = false;
const startTimer = async () => {
    let presentTime = document.getElementById('timer').innerHTML;
    let timeArray = presentTime.split(":");
    let m = timeArray[0];
    let s = checkSecond((timeArray[1] - 1));
    if(s == 59){
        m -= 1;
    }
    if(m < 0){
        alert("หมดเวลา");
        isTimeOut = true;
        sessionStorage.setItem("playedword", JSON.stringify(randomWords));
        sessionStorage.setItem("timeout", String(isTimeOut));
        window.location.href = 'summary.html';
    }
    document.getElementById('timer').innerHTML = m + ":" + s;
    setTimeout(startTimer, 1000); 
}

const checkSecond = (sec) => {
    if (sec < 10 && sec >= 0) {
        sec = "0" + sec;
    }
    // Add zero in front of numbers < 10
    if (sec < 0) {
        sec = "59";
    }
    return sec;
}

let score;
let randomWords;
const getRandomWords = async () =>{
    randomWords = JSON.parse(sessionStorage.getItem("randomWords"));
}

const initGame = async () => {
    let wordArray = [];
    for(let i = 0; i < 5; i++){
        wordArray[i] = randomWords[i];
    }    
    // Shuffle for inserting in word-container
    for(let i = wordArray.length - 1; i > 0; i--){
        let j = Math.floor(Math.random() * (i + 1));
        [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
    }
    // Fill words in the word-button
    for(let i = 0; i < wordArray.length; i++){
        wordInBox[i].innerHTML = wordArray[i]["headword"];
    }
    // Shuffle for inserting in question-container
    for(let i = wordArray.length - 1; i > 0; i--){
        let j = Math.floor(Math.random() * (i + 1));
        [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
    }
    // Fill meanings in the meaning-box
    for(let i = 0; i < wordArray.length; i++){
        meaningInBox[i].innerHTML = wordArray[i]["meaning"];
    }
    score = 0;
}

setTimeout(() =>{
    getRandomWords().then(initGame).then(startTimer);
}, 1000);

let wordButtonSelected = document.getElementsByClassName("word-button-selected");

const clickWordButton = (id, cName) =>{
    // Click to select word
    if(cName == "word-button"){
        if(wordButtonSelected.length > 0){
            wordButtonSelected[0].className = wordButtonSelected[0].className.replace("-selected", "");
        }
        document.getElementById(id).className += "-selected";
    }
    // Click to deselect word
    if(cName == "word-button-selected"){
        document.getElementById(id).className = document.getElementById(id).className.replace("-selected", "");
    }
    // Click to place the word in answer-box
    if(cName == "word-answer"){
        if(wordButtonSelected.length > 0){
            let oid = wordButtonSelected[0].id;
            // Set value to new source
            document.getElementById(id).innerHTML = wordButtonSelected[0].innerHTML;
            document.getElementById(id).className = document.getElementById(id).className.replace("answer", "button");
            wordButtonSelected[0].className = wordButtonSelected[0].className.replace("-selected", "");
            // Remove word-button from old source
            let pclass = document.getElementById(oid).parentElement.className;
            if(pclass == "word-container"){
                document.getElementById(oid).remove();
            }
            if(pclass == "question-box"){
                document.getElementById(oid).className = document.getElementById(oid).className.replace("button", "answer");
                document.getElementById(oid).innerHTML = "";
            }
        }
    }
}

let correctWord = 0;

const checkAnswer = () =>{
    let correctAnswer = 0;
    let ws = randomWords;
    let qb = document.querySelectorAll(".question-box");
    // Check all question
    for(let i = 0; i < qb.length; i++){
        let w = qb[i].children[0].children[0];
        // Create new word object
        let wm = {
            headword: "",
            meaning: meaningInBox[i].innerHTML
        }
        // Add headword to the object if it is not empty
        if(w){ wm["headword"] = w.innerHTML;
        }
        // Check if word is matched correctly, count the correct word
        for(let j = 0; j < ws.length; j++){
            if(ws[j]["headword"] == wm["headword"] && ws[j]["meaning"] == wm["meaning"]){
                correctAnswer += 1;
            }
        }
    }    
    score = correctAnswer * 100; 
    let status = document.querySelector(".status");
    status.innerHTML = "ถูกต้อง "+correctAnswer+" คำ";

    // Stop timer when complete
    if(correctAnswer == 5){
        clearTimeout();
        sessionStorage.setItem("gamemode", gameMode);
        sessionStorage.setItem("sc", String(score * multiplier));
        sessionStorage.setItem("playedword", JSON.stringify(randomWords));
        sessionStorage.setItem("timeout", String(isTimeOut));
        window.location.href = 'summary.html';    
    }
}

const clearAllAnswer = () =>{
    // Remove all word button
    let allButton = document.querySelectorAll(".word-button, .word-button-selected, .word-answer");
    for (let i = 0; i < allButton.length; i++){
        allButton[i].remove();
    }
    // Restore word container
    let wc = document.querySelector(".word-container");
    for (let i = 0; i < wordInBox.length; i++){
        let wb = document.createElement("button");
        wb.id = "word-button-" + String(i + 1);
        wb.className = "word-button";
        wb.setAttribute("onclick","clickWordButton(this.id, this.getAttribute('class'))");
        let w = document.createElement("p");
        w.className = "word";
        let wt = document.createTextNode(wordInBox[i].innerHTML);
        w.appendChild(wt);
        wb.appendChild(w);
        wc.appendChild(wb);
    }
    // Restore answer box
    let qb = document.querySelectorAll(".question-box");
    for (let i = 0; i < qb.length; i++){
        let wa = document.createElement("button");
        wa.id = "word-answer-" + String(i + 1);
        wa.className = "word-answer";
        wa.setAttribute("onclick","clickWordButton(this.id, this.getAttribute('class'))");
        qb[i].insertBefore(wa, qb[i].children[0]);
    }
}




