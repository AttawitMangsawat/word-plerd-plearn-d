let gameMode = sessionStorage.getItem("gamemode");
let gameDifficulty = sessionStorage.getItem("gamedifficulty");

const meaningInBox = document.getElementsByClassName("meaning");
const wordInBox = document.getElementsByClassName("word-box");

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

const initGame = async () =>{
    let wordArray = [];
    for(let i = 0; i < 5; i++){
        wordArray[i] = randomWords[i];
    }
    // Shuffle for inserting in question-box
    for(let i = wordArray.length - 1; i > 0; i--){
        let j = Math.floor(Math.random() * (i + 1));
        [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
    }

    for(let i = 0; i < wordArray.length; i++){
        let wordChars = wordArray[i]["headword"].split("");
        let blankChars = [];
        // Determine index of cell which is to be an input cell
        for(let j = 0; j < (wordChars.length)/2; j++){
            let toBlank = Math.floor(Math.random() * wordChars.length);
            // Re-random if repeat
            while(blankChars.includes(toBlank)){
                toBlank = Math.floor(Math.random() * wordChars.length);
            }
            blankChars.push(toBlank);
        }
        for(let j = 0; j < wordChars.length; j++){
            // Create cell
            let cell = document.createElement("div");
            cell.className = "cell";
            wordInBox[i].appendChild(cell);
            // Create input in cell
            if(blankChars.includes(j)){
                let input = document.createElement("input");
                let si, sj;
                if(i < 10){
                    si = "0"+String(i);
                }
                else{
                    si = String(i);
                }
                if(j < 10){
                    sj = "0"+String(j);
                }
                else{
                    sj = String(j);
                }
                input.setAttribute("type", "text");
                input.setAttribute("id", "cell-"+si+"-"+sj);
                input.setAttribute("maxlength", "1");
                input.setAttribute("onkeyup", "typeAutoNext(this.id)");
                input.setAttribute("onclick", "selectCell(this.id)");
                wordInBox[i].children[j].appendChild(input);
            }
            // Create letter in cell
            else{
                let letter = document.createElement("p");
                letter.className = "letter";
                letter.innerText = wordChars[j];
                wordInBox[i].children[j].appendChild(letter);
            }    
        }
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

const typeAutoNext = (id) =>{
    let wbIndex = parseInt(id[5]+id[6]);
    let cellIndex = parseInt(id[8]+id[9]);
    let wbCells = document.getElementById("word-box-"+String(wbIndex+1)).children;
    while(wbCells[cellIndex].nextElementSibling){
        if(wbCells[cellIndex].nextElementSibling.firstChild.tagName == "INPUT"){
            wbCells[cellIndex].nextElementSibling.firstChild.select();
            wbCells[cellIndex].nextElementSibling.firstChild.focus();
            break;
        }
        else{
            wbCells[cellIndex].firstChild.blur();
            cellIndex++;
        } 
    }
    wbCells[cellIndex].firstChild.blur();
}

const selectCell = (id) =>{
    document.getElementById(id).select();
}

let correctWord = 0;

const checkAnswer = () =>{
    let correctAnswer = 0;
    let ws = randomWords;
    let qb = document.querySelectorAll(".question-box");
    // Check all question-box
    for(let i = 0; i < qb.length; i++){
        let cells = qb[i].children[0].children;
        // Get characters from cells to create a word
        let wa = "";
        for(let j = 0; j < cells.length; j++){
            if(cells[j].children[0].tagName == "INPUT"){
                 wa += cells[j].children[0].value;
            }
            else{
                wa += cells[j].children[0].innerText;
            }
        }
        wa = wa.toLowerCase();
        // Create map for checking
        let wm = {
            headword: wa,
            meaning: meaningInBox[i].innerHTML
        };
        for(let j = 0; j < ws.length; j++){
            if(ws[j]["headword"].toLowerCase() == wm["headword"] && ws[j]["meaning"] == wm["meaning"]){
                correctAnswer += 1;
            } 
        }
    }
    score = correctAnswer * 100;
    let status = document.querySelector(".status");
    status.innerHTML = "ถูกต้อง "+ correctAnswer +" คำ";

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
    let qb = document.querySelectorAll(".question-box");
    // Check all question-box
    for(let i = 0; i < qb.length; i++){
        let cells = qb[i].children[0].children;
        // Delete all input
        for(let j = 0; j < cells.length; j++){
            if(cells[j].children[0].tagName == "INPUT"){
                cells[j].children[0].value = "";
            }
        }
    }
}
