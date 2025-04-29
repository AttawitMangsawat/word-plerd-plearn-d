import {ref, get, query, orderByChild, equalTo} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import {wordDb, userDb} from "../../db.js";

let gameMode = sessionStorage.getItem("gamemode");
let gameDifficulty = sessionStorage.getItem("gamedifficulty");

console.log(gameDifficulty);

let gameWords;

const getAllWord = async () => {    
    let allWord = [];
    /*let userId = sessionStorage.getItem("uid");*/

    // Choose word source
    let r;
    if(gameMode === "Adventure"){
        r = ref(wordDb);
    }
    /*else if(gameMode === "Practice"){
        r = ref(userDb, userId + "/wordlist");
    }*/
    else{
        console.log("error");
        return;
    }

    // Query and get all word by selected difficulty from database
    const q = query(r, orderByChild("difficulty"), equalTo(parseInt(gameDifficulty)));
    await get(q).then((snapshot) => {        
        snapshot.forEach(childSnapshot => {
            allWord.push(childSnapshot.val());
        });
        gameWords = allWord;
        randomWord();
    });
}

const randomWord = async () => {
    let randomWords = new Array(5);
    // Randomly getting words into array
    for(let i = 0; i < randomWords.length; i++){
        let w = gameWords[Math.floor(Math.random() * gameWords.length)];
        // Re-random if repeat
        while(randomWords.includes(w)){
            w = gameWords[Math.floor(Math.random() * gameWords.length)];
        }
        randomWords[i] = w;
    }
    sessionStorage.setItem("randomWords", JSON.stringify(randomWords));  
}

getAllWord();