import { CARDS, pickRandom, judge, TYPE_PT } from "./cards.js";

/* ======= DOM ======= */
const $playerCards = document.querySelector("#player-cards");
const $computerCards = document.querySelector("#computer-cards");
const $playerFieldCard = document.querySelector("#player-field-card");
const $computerFieldCard = document.querySelector("#computer-field-card");
const $name = document.querySelector("#card-name");
const $type = document.querySelector("#card-type");
const $img = document.querySelector("#card-image");
const $score = document.querySelector("#score_points");
const $nextDuel = document.querySelector("#next-duel");

const $overlay = document.getElementById("overlay");
const $modal = $overlay.querySelector(".modal");
const $btnPrimary = document.getElementById("btn-primary");
const $btnHelp = document.getElementById("btn-help");

/* ======= Áudio ======= */
const bgm  = document.getElementById("bgm");
const sWin = document.getElementById("sfx-win");
const sLose= document.getElementById("sfx-lose");
bgm.volume = 0.4;

/* ======= Estado ======= */
let playerScore = 0;
let computerScore = 0;
let gameStarted = false;

/* ======= UI Aux ======= */
function setDetails(card){
  if(!card){
    $name.textContent = "—";
    $type.textContent = "—";
    $img.removeAttribute("src");
    $img.removeAttribute("alt");
    return;
  }
  $name.textContent = card.name;
  $type.textContent = (TYPE_PT[card.type] || "").toUpperCase();
  $img.src = card.img;
  $img.alt = card.name;
}
function updateScore(){
  $score.textContent = `Vitórias: ${playerScore} | Derrotas: ${computerScore}`;
}

/* ======= Renderização ======= */
function renderComputerHand(){
  $computerCards.innerHTML = "";
  CARDS.forEach(() => {
    const back = document.createElement("div");
    back.className = "card";
    back.innerHTML = `<img src="./src/assets/icons/card-back.png" alt="">`;
    $computerCards.appendChild(back);
  });
}
function renderPlayerHand(){
  $playerCards.innerHTML = "";
  CARDS.forEach(card => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    cardDiv.innerHTML = `<img src="${card.img}" alt="${card.name}">`;
    cardDiv.addEventListener("click", () => gameStarted && playRound(card));
    $playerCards.appendChild(cardDiv);
  });
}

/* ======= Lógica ======= */
function playRound(playerCard){
  const computerCard = pickRandom();

  $playerFieldCard.src   = playerCard.img;
  $playerFieldCard.alt   = playerCard.name;
  $computerFieldCard.src = computerCard.img;
  $computerFieldCard.alt = computerCard.name;

  const result = judge(playerCard, computerCard);
  if(result === "win"){
    playerScore++; sWin.currentTime = 0; sWin.play();
    showBanner("Você venceu!");
  }else if(result === "lose"){
    computerScore++; sLose.currentTime = 0; sLose.play();
    showBanner("Você perdeu!");
  }else{
    showBanner("Empate!");
  }
  updateScore();
  setDetails(playerCard);
}

function showBanner(text){
  $nextDuel.style.display = "block";
  $nextDuel.textContent = text;
}

function resetDuel(){
  $playerFieldCard.removeAttribute("src");
  $playerFieldCard.removeAttribute("alt");
  $computerFieldCard.removeAttribute("src");
  $computerFieldCard.removeAttribute("alt");
  setDetails(null);
  $nextDuel.style.display = "none";
}

/* ======= Overlay / Ajuda ======= */
function openOverlay(mode = "help"){
  $overlay.classList.add("show");

  // adiciona botão de reset no modal (se ainda não existir)
  if(!document.getElementById("btn-reset")){
    const btnReset = document.createElement("button");
    btnReset.id = "btn-reset";
    btnReset.className = "rpgui-button";
    btnReset.textContent = "Reiniciar jogo";
    btnReset.style.marginTop = "10px";
    btnReset.addEventListener("click", resetGame);
    $modal.appendChild(btnReset);
  }

  if(mode === "start"){
    $btnPrimary.textContent = "Iniciar duelo";
    $btnPrimary.onclick = startGame;
  }else{
    $btnPrimary.textContent = "Voltar ao duelo";
    $btnPrimary.onclick = closeOverlay;
  }

  requestAnimationFrame(() => $btnPrimary.focus());
}
function closeOverlay(){ $overlay.classList.remove("show"); }

/* ======= RESET GERAL ======= */
function resetGame(){
  playerScore = 0;
  computerScore = 0;
  gameStarted = false;
  updateScore();
  resetDuel();
  bgm.pause();
  bgm.currentTime = 0;
  openOverlay("start");
}

/* ======= Eventos extras ======= */
// fecha clicando fora
$overlay.addEventListener("click", (e) => {
  if(e.target === $overlay) closeOverlay();
});
// fecha com ESC
document.addEventListener("keydown", (e) => {
  if(e.key === "Escape" && $overlay.classList.contains("show")) closeOverlay();
});
// tecla R = reset
document.addEventListener("keydown", (e) => {
  if(e.key.toLowerCase() === "r") resetGame();
});

/* ======= Ciclo ======= */
function startGame(){
  if(!gameStarted){
    gameStarted = true;
    bgm.play().catch(()=>{});
  }
  closeOverlay();
  renderComputerHand();
  renderPlayerHand();
  updateScore();
  setDetails(null);
}

/* ======= Eventos ======= */
$btnPrimary.onclick = startGame;
$btnHelp.addEventListener("click", () => openOverlay("help"));
document.body.addEventListener("pointerdown", () => {
  if(gameStarted && bgm.paused) bgm.play().catch(()=>{});
}, { once:true });

/* ======= Boot ======= */
renderComputerHand();
openOverlay("start");
window.resetDuel = resetDuel;
window.resetGame = resetGame;
