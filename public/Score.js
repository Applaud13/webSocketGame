import { SOCKET } from "./Constants.js";
import { sendEvent } from "./socket.js";

class Score {
  score = 0;
  HIGH_SCORE_KEY = SOCKET.HIGHSCORE;
  USER_SCORE_KEY = SOCKET.USERSCORE;
  scorePerTime = 0.001;

  constructor(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
  }

  update(deltaTime) {
    this.score += deltaTime * this.scorePerTime;

    if (this.score > this.stageClearScore && this.stageChange) {
      this.stageChange = false;
      sendEvent(11, { timeStamp: Date.now() });
    }
  }

  grabItem(item) {
    this.score += item.score;
  }

  reset() {
    this.score = 0;
  }

  // setHighScore() {
  //   const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
  //   if (this.score > highScore) {
  //     localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
  //   }
  // }

  getScore() {
    return this.score;
  }

  draw() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    const userScore = Number(localStorage.getItem(this.USER_SCORE_KEY)); // 개인 기록
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = "#525250";

    const scoreX = this.canvas.width - 120 * this.scaleRatio;
    const highScoreX = scoreX - 350 * this.scaleRatio;
    const highScoreX2 = scoreX - 175 * this.scaleRatio; // 개인 기록

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
    const highScorePadded = highScore.toString().padStart(6, 0);
    const highScorePadded2 = userScore.toString().padStart(6, 0); // 개인 기록

    this.ctx.fillText(`점수 ${scorePadded}`, scoreX, y);
    this.ctx.fillText(`서버기록 ${highScorePadded}`, highScoreX, y);
    this.ctx.fillText(`개인기록 ${highScorePadded2}`, highScoreX2, y); // 개인 기록
  }
}

export default Score;
