const nextColor={
    "grey-box":"yellow-box",
    "yellow-box":"green-box",
    "green-box":"grey-box"
};

let currentGuess = [];
let nextLetter = 0;
const NUMBER_OF_GUESSES = 6;
let intents = 0;
let linies = [];
let diccionari = "diccionari_cast.txt";
	


async function initBoard() {
    let board = document.getElementById("game-board");

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"
        
        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div")
            box.className = "grey-box"
			box.addEventListener("click", function(){
				this.className=nextColor[this.className];				
			});
            row.appendChild(box)
        }
		board.appendChild(row)
	}
	//carregam el diccionari
	await carregaDiccionari();
	
	document.addEventListener("keyup", (e) => {

		let pressedKey = String(e.key)
		if (pressedKey === "Backspace" && nextLetter !== 0) {
			deleteLetter()
			return
		}

		if (pressedKey === "Enter") {
			checkGuess()
			return
		}

		let found = pressedKey.match(/[a-z]/gi)
		if (!found || found.length > 1) {
			return
		} else {
			insertLetter(pressedKey)
		}
	})

	document.getElementById("keyboard-cont").addEventListener("click", (e) => {
		const target = e.target
		
		if (!target.classList.contains("btn")) {
			return
		}
		let key = target.textContent

		if (key === "Del") {
			key = "Backspace"
		} 
		document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
	})	
}

async function carregaDiccionari(){	
	console.log("Carrega dicc");

	let url = "/" + diccionari;
	let response = await fetch(url);
	const result = await response.text();
	//console.log(result);
	linies = result.split("\n");
}



function insertLetter (pressedKey) {
    if (nextLetter === 5) {
        return
    }
    pressedKey = pressedKey.toLowerCase()
    let row = document.getElementsByClassName("letter-row")[intents]
    let box = row.children[nextLetter]
    box.textContent = pressedKey
    //box.classList.add("grey-box")
    currentGuess.push(pressedKey)
    nextLetter += 1	
}

function deleteLetter () {
    let row = document.getElementsByClassName("letter-row")[intents]
    let box = row.children[nextLetter - 1]
    box.textContent = ""
    //box.classList.remove("letter-box")
    currentGuess.pop()
    nextLetter -= 1
}

function checkGuess () {	
	let guessString = '';	
	let paraules = [];
	let paraula = "";
	let paraula_original = "";	
	console.log("CheckGuess1");
	
    for (const val of currentGuess) {
        guessString += val
    }
	
    if (guessString.length != 5) {
        alert("¡Faltan letras!" + nextLetter)
        return
    }
	
	for (let k = 0; k < intents + 1; k++){
		let row = document.getElementsByClassName("letter-row")[k];
		for (let ik = 0; ik < nextLetter; ik++) {
			let box = row.children[ik];
		}
		let reg_verda ='';
		let reg_groga = '';
		let reg_groga2 = '';
		let reg_gris = '';
		let groga_flag = true;

		//Cream les expressions regulars
		reg_verda = reg_verda + "^"
		for (let i = 0 ; i < nextLetter; i++) {
			let box = row.children[i]
			//console.log("Lletra: " + box.textContent + " intent: " + k + " nlletra: " + i);
			//console.log("Lletra: " + box.textContent);
			switch(box.className){
				case "grey-box":
					reg_gris = reg_gris + box.textContent
					reg_verda = reg_verda + "."	
					reg_groga2 = reg_groga2 + "."
				break;
				case "yellow-box":
					reg_groga = reg_groga + box.textContent
					reg_groga2 = reg_groga2 + box.textContent
					reg_verda = reg_verda + "."
				break;
				case "green-box":
					reg_verda = reg_verda + box.textContent
					reg_groga2 = reg_groga2 + "."
				break;
				default:
				break;
			}
		}
		reg_verda = reg_verda + "$"
			
		//Les lletres que no hi són
		reg_gris = new RegExp("\\b([^" + reg_gris + "]{5})\\b",'gi');
		//Les lletres que estan a un lloc concret
		reg_verda = new RegExp(reg_verda,'gi');		
		console.log("Reg_gris: " + reg_gris);
		console.log("Reg_verda: " + reg_verda);
		console.log("Linies: " + linies);
		
		
		linies.forEach(function(paraula) {		
			//miram les que coincideixen amb la expresió regular que controla les lletres que no existeixen
			let gris = String(paraula.match(reg_gris));		
			//console.log("Gris: " + gris);
			if (gris.length == 5){
				//miram les que coincideixen amb la expresió regular que controla les lletres que estan en la posició exacta
				let verda = String(gris.match(reg_verda));
				//console.log("Verda: " + verda);
				if(verda.length == 5){
					//console.log("Paraula: " + paraula)
					//console.log("Anam a cercar la groga");
					groga_flag = true;
					//miram les que coincideixen amb la expresió regular que controla les lletres que no estan en la posició exacta
					for (var i = 0; i < reg_groga.length; i++) {
						if (!verda.includes(reg_groga.charAt(i))){
							groga_flag = false;
							//console.log("No té la lletra: " + reg_groga.charAt(i));
						}
					}
					//console.log("groga_flag: " + groga_flag);
					if (groga_flag){
						//Miram que no estigui a la posició indicada
						//console.log("Reg_groga2: " + reg_groga2);
						for (var i = 0; i < 5; i++) {
							if (reg_groga2.charAt(i) != "."){
								if (verda.charAt(i) == reg_groga2.charAt(i)){
									groga_flag = false;
								}
							}
						}
						if (groga_flag){
							//console.log("Trobada");
							//console.log("Paraula: " + paraula);
							paraules.push(paraula);
						}
					}
				}
			}
		})
	
		document.getElementById("texte").value = paraules;
		linies = paraules;
		paraules = [];
		groga_flag = true;	
		console.log("Fi intent");
	}
	intents = intents + 1;	
	nextLetter = 0;
	currentGuess = [];
}



initBoard()