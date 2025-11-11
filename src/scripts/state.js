export const state = {
  score: { win: 0, lose: 0 },
  playerField: null,
  computerField: null,
  stage: "duel", // menu | duel | result
  audio: {
    bgmStarted: false
  }
};

export function resetDuel(){
  state.playerField = null;
  state.computerField = null;
  state.stage = "duel";
}
export function addScore(result){
  if(result === "win")  state.score.win++;
  if(result === "lose") state.score.lose++;
}
