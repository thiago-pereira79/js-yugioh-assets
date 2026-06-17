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
const $bgVideo = document.querySelector(".video");

const CARD_BACK_SRC = "./src/assets/icons/card-back.png";
const STATIC_IMAGE_SRC = [
  CARD_BACK_SRC,
  "./src/assets/icons/millenium2.png",
  ...CARDS.map((card) => card.img),
];
const CARD_BY_ID = new Map(CARDS.map((card) => [card.id, card]));
const PRELOADED_IMAGES = new Map();

/* ======= Áudio ======= */
const bgm  = document.getElementById("bgm");
const sWin = document.getElementById("sfx-win");
const sLose= document.getElementById("sfx-lose");
bgm.volume = 0.4;
[bgm, sWin, sLose].forEach((audio) => {
  audio.preload = "auto";
  audio.load();
});

/* ======= Estado ======= */
let playerScore = 0;
let computerScore = 0;
let gameStarted = false;
let lastDetailsId = null;
let sfxUnlocked = false;
let lastPointerActivation = 0;

/* ======= Performance helpers ======= */
function preloadImages(){
  STATIC_IMAGE_SRC.forEach((src) => {
    const image = new Image();
    image.decoding = "async";
    image.loading = "eager";
    image.src = src;
    PRELOADED_IMAGES.set(src, image);
    if(image.decode) image.decode().catch(() => {});
  });
}

function createCardImage(src, alt = ""){
  const image = document.createElement("img");
  image.src = src;
  image.alt = alt;
  image.decoding = "async";
  image.loading = "eager";
  image.draggable = false;
  return image;
}

function createCardElement(card){
  const cardDiv = document.createElement("div");
  cardDiv.className = "card";
  if(card) cardDiv.dataset.cardId = card.id;
  cardDiv.appendChild(createCardImage(card ? card.img : CARD_BACK_SRC, card ? card.name : ""));
  return cardDiv;
}

function setTextIfChanged(element, text){
  if(element.textContent !== text) element.textContent = text;
}

function setImageIfChanged(image, src, alt){
  if(image.getAttribute("src") !== src) image.src = src;
  if(image.alt !== alt) image.alt = alt;
}

function clearImage(image){
  if(image.hasAttribute("src")) image.removeAttribute("src");
  if(image.hasAttribute("alt")) image.removeAttribute("alt");
}

function safePlay(audio, restart = false){
  try{
    if(restart) audio.currentTime = 0;
    const playback = audio.play();
    if(playback && playback.catch) playback.catch(() => {});
  }catch{
    // Playback can be blocked by browser policy.
  }
}

function playSfx(audio){
  requestAnimationFrame(() => safePlay(audio, true));
}

function warmSfx(){
  if(sfxUnlocked) return;
  sfxUnlocked = true;
  [sWin, sLose].forEach((audio) => {
    const warmAudio = audio.cloneNode(true);
    warmAudio.volume = 0;
    warmAudio.preload = "auto";
    warmAudio.load();
    try{
      const playback = warmAudio.play();
      if(playback && playback.then){
        playback
          .then(() => {
            warmAudio.pause();
            warmAudio.currentTime = 0;
          })
          .catch(() => {});
      }else{
        warmAudio.pause();
        warmAudio.currentTime = 0;
      }
    }catch{
      // Best effort only.
    }
  });
}

function syncBackgroundVideo(){
  if(!$bgVideo) return;
  if(document.hidden){
    $bgVideo.pause();
  }else{
    safePlay($bgVideo);
  }
}

/* ======= UI Aux ======= */
function setDetails(card){
  if(!card){
    lastDetailsId = null;
    setTextIfChanged($name, "—");
    setTextIfChanged($type, "—");
    clearImage($img);
    return;
  }
  if(lastDetailsId === card.id) return;
  lastDetailsId = card.id;
  setTextIfChanged($name, card.name);
  setTextIfChanged($type, (TYPE_PT[card.type] || "").toUpperCase());
  setImageIfChanged($img, card.img, card.name);
}
function updateScore(){
  setTextIfChanged($score, `Vitórias: ${playerScore} | Derrotas: ${computerScore}`);
}

/* ======= Renderização ======= */
function renderComputerHand(){
  const fragment = document.createDocumentFragment();
  CARDS.forEach(() => fragment.appendChild(createCardElement(null)));
  $computerCards.replaceChildren(fragment);
}
function renderPlayerHand(){
  const fragment = document.createDocumentFragment();
  CARDS.forEach((card) => fragment.appendChild(createCardElement(card)));
  $playerCards.replaceChildren(fragment);
}

/* ======= Lógica ======= */
function playRound(playerCard){
  const computerCard = pickRandom();

  setImageIfChanged($playerFieldCard, playerCard.img, playerCard.name);
  setImageIfChanged($computerFieldCard, computerCard.img, computerCard.name);

  const result = judge(playerCard, computerCard);
  if(result === "win"){
    playerScore++;
    playSfx(sWin);
    showBanner("Você venceu!");
  }else if(result === "lose"){
    computerScore++;
    playSfx(sLose);
    showBanner("Você perdeu!");
  }else{
    showBanner("Empate!");
  }
  updateScore();
  setDetails(playerCard);
}

function showBanner(text){
  $nextDuel.style.display = "block";
  setTextIfChanged($nextDuel, text);
}

function resetDuel(){
  clearImage($playerFieldCard);
  clearImage($computerFieldCard);
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
    safePlay(bgm);
    warmSfx();
  }
  closeOverlay();
  if($computerCards.children.length !== CARDS.length) renderComputerHand();
  if($playerCards.children.length !== CARDS.length) renderPlayerHand();
  updateScore();
  setDetails(null);
}

function handleCardActivation(event){
  if(event.type === "click" && performance.now() - lastPointerActivation < 350) return;
  const target = event.target instanceof Element ? event.target : null;
  const cardElement = target ? target.closest(".card") : null;
  if(!gameStarted || !cardElement || !$playerCards.contains(cardElement)) return;
  if(event.type === "pointerup") lastPointerActivation = performance.now();
  const card = CARD_BY_ID.get(cardElement.dataset.cardId);
  if(card) playRound(card);
}

function resumeBgmAfterGesture(){
  if(gameStarted && bgm.paused) safePlay(bgm);
}

/* ======= Eventos ======= */
$btnPrimary.onclick = startGame;
$btnHelp.addEventListener("click", () => openOverlay("help"));
$playerCards.addEventListener("pointerup", handleCardActivation, { passive:true });
$playerCards.addEventListener("click", handleCardActivation);
document.body.addEventListener("pointerdown", resumeBgmAfterGesture, { passive:true });
document.addEventListener("visibilitychange", syncBackgroundVideo);

/* ======= Boot ======= */
preloadImages();
renderComputerHand();
openOverlay("start");
window.resetDuel = resetDuel;
window.resetGame = resetGame;
