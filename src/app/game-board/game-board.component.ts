import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.css',
})
export class GameBoardComponent implements AfterViewInit {
  @ViewChild('gameOverDialog') gameOverDialog!: ElementRef;
  @ViewChild('gameStartDialog') gameStartDialog!: ElementRef;
  gridArr;
  minimaxTime!: number;
  resultVal!: number;
  computersTurn: boolean;
  computerStartsNext: boolean;
  isVsPlayer!: boolean;
  opponentsTurn: boolean;

  computerScore!: number;
  playerScore!: number;
  opponentScore!: number;

  ngAfterViewInit(): void {
    this.gameStartDialog.nativeElement.showModal();
  }

  constructor() {
    this.gridArr = new Array(16).fill(null);
    this.computersTurn = false;
    this.computerStartsNext = true;
    this.opponentsTurn = false;
  }

  onChooseOpponent(event: Event) {
    let target = event.target as HTMLElement;
    while (target && target.tagName !== 'BUTTON') {
      target = target.parentElement as HTMLElement;
    }
    this.isVsPlayer = target.id == 'player';
    if (this.isVsPlayer) {
      this.playerScore = 0;
      this.opponentScore = 0;
    } else {
      this.playerScore = 0;
      this.computerScore = 0;
    }
    this.gameStartDialog.nativeElement.close();
  }

  onPress(event: Event) {
    const element = event.target as HTMLElement;
    const cellId: number = parseInt(element.id, 10);
    if (this.isVsPlayer) {
      this.vsPlayer(cellId);
    } else {
      this.vsComputer(cellId);
    }
  }

  vsPlayer(cellId: number) {
    if (!this.gridArr[cellId]) {
      if (!this.opponentsTurn) {
        this.gridArr[cellId] = 'X';
        this.opponentsTurn = !this.opponentsTurn;
      } else {
        this.gridArr[cellId] = 'O';
        this.opponentsTurn = !this.opponentsTurn;
      }
      if (!this.isMovesLeft(this.gridArr) || this.evaluate(this.gridArr) != 0) {
        this.resultVal = this.evaluate(this.gridArr);
        this.handleScore(this.resultVal);
        this.gameOverDialog.nativeElement.showModal();
      }
    }
  }

  vsComputer(cellId: number) {
    if (!this.gridArr[cellId] && !this.computersTurn) {
      this.gridArr[cellId] = 'X';
      this.computersTurn = true;
      if (!this.isMovesLeft(this.gridArr) || this.evaluate(this.gridArr) != 0) {
        this.resultVal = this.evaluate(this.gridArr);
        this.handleScore(this.resultVal);
        this.gameOverDialog.nativeElement.showModal();
      } else {
        this.computersMove();
      }
    }
  }

  onPlayAgain() {
    this.gridArr = new Array(16).fill(null);
    this.gameOverDialog.nativeElement.close();
    if (!this.isVsPlayer) {
      if (this.computerStartsNext) {
        this.computersMove();
      } else {
        this.computersTurn = false;
      }
      this.computerStartsNext = !this.computerStartsNext;
    }
  }

  computersMove() {
    if (typeof Worker !== 'undefined') {
      const worker = new Worker(
        new URL('../game-board.worker', import.meta.url)
      );
      worker.onmessage = ({ data }) => {
        const bestMove = data.move;
        this.gridArr[bestMove] = 'O';
        if (
          !this.isMovesLeft(this.gridArr) ||
          this.evaluate(this.gridArr) != 0
        ) {
          this.resultVal = this.evaluate(this.gridArr);
          this.handleScore(this.resultVal);
          this.gameOverDialog.nativeElement.showModal();
        } else {
          this.computersTurn = false;
        }
      };
      worker.postMessage({ grid: this.gridArr, time: new Date().getSeconds() });
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
  }

  handleScore(result: number) {
    if (result == -10) {
      this.playerScore++;
    } else if (result == 10) {
      if (this.isVsPlayer) {
        this.opponentScore++;
      } else {
        this.computerScore++;
      }
    }
  }

  isMovesLeft(board: any[]): boolean {
    for (let i = 0; i < 16; i++)
      if (board[i] === null || board[i] === undefined) return true;
    return false;
  }

  evaluate(board: any[]): number {
    const winningCombinations = [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [8, 9, 10, 11],
      [12, 13, 14, 15],
      [0, 4, 8, 12],
      [1, 5, 9, 13],
      [2, 6, 10, 14],
      [3, 7, 11, 15],
      [0, 5, 10, 15],
      [3, 6, 9, 12],
    ];

    for (let combination of winningCombinations) {
      const [a, b, c, d] = combination;

      if (
        board[a] &&
        board[a] === board[b] &&
        board[a] === board[c] &&
        board[a] === board[d]
      ) {
        if (board[a] == 'X') {
          return -10;
        }
        if (board[a] == 'O') {
          return +10;
        }
      }
    }
    return 0;
  }
}
