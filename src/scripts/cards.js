// catálogo simples de cartas + tipos
export const TYPE = {
  MAGE: "mage",
  DRAGON: "dragon",
  WARRIOR: "warrior",
};

// tradução para exibir na UI
export const TYPE_PT = {
  [TYPE.MAGE]: "Mago",
  [TYPE.DRAGON]: "Dragão",
  [TYPE.WARRIOR]: "Guerreiro",
};

// use os arquivos que você tem em /src/assets/icons
export const CARDS = [
  { id: "magician", name: "Mago Negro",  type: TYPE.MAGE,   img: "./src/assets/icons/magician.png" },
  { id: "dragon",   name: "Blue-Eyes Dragon", type: TYPE.DRAGON, img: "./src/assets/icons/dragon.png" },
  { id: "exodia",   name: "Exodia",      type: TYPE.WARRIOR, img: "./src/assets/icons/exodia.png" },
];

// Jo-Ken-Pô das cartas
// Mago > Dragão ; Dragão > Guerreiro ; Guerreiro > Mago
export function judge(player, computer){
  if (player.type === computer.type) return "draw";
  if (
    (player.type === TYPE.MAGE    && computer.type === TYPE.DRAGON)  ||
    (player.type === TYPE.DRAGON  && computer.type === TYPE.WARRIOR) ||
    (player.type === TYPE.WARRIOR && computer.type === TYPE.MAGE)
  ) return "win";
  return "lose";
}

export function pickRandom(){
  return CARDS[Math.floor(Math.random() * CARDS.length)];
}
