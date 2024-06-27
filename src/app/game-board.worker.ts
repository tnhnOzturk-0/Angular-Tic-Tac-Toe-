/// <reference lib="webworker" />

let minimaxTime: number = 0;

function isMovesLeft(board: any[]): boolean {
  for (let i = 0; i < 16; i++)
    if (board[i] === null || board[i] === undefined) return true;
  return false;
}

function evaluate(board: any[]): number {
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

function minimax(
  board: any[],
  depth: number,
  isCom: boolean,
  alpha: number,
  beta: number
): number {
  let score = evaluate(board);

  if (score == 10) return score;
  if (score == -10) return score;
  if (!isMovesLeft(board)) return 0;

  if (new Date().getSeconds() - minimaxTime >= 10) {
    return heuristic(board);
  }

  if (isCom) {
    let best = -1000;

    for (let i = 0; i < 16; i++) {
      if (!board[i]) {
        board[i] = 'O';
        best = Math.max(best, minimax(board, depth + 1, false, alpha, beta));
        board[i] = null;
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  } else {
    let best = 1000;

    for (let i = 0; i < 16; i++) {
      if (!board[i]) {
        board[i] = 'X';
        best = Math.min(best, minimax(board, depth + 1, true, alpha, beta));
        board[i] = null;
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  }
}

function findBestMove(board: any[]): number {
  let bestVal = -1000;
  let bestMove = -1;

  for (let i = 0; i < 16; i++) {
    if (!board[i]) {
      board[i] = 'O';
      let moveVal = minimax(board, 0, false, -1000, 1000);
      board[i] = null;

      if (moveVal > bestVal) {
        bestMove = i;
        bestVal = moveVal;
      }
    }
  }

  return bestMove;
}

function heuristic(board: any[]): number {
  const size = 4;
  const x_player = 'X';
  const o_player = 'O';

  let x3 = 0;
  let x2 = 0;
  let x1 = 0;
  let o3 = 0;
  let o2 = 0;
  let o1 = 0;

  function getValueAt(row: number, col: number) {
    return board[row * size + col];
  }

  // Check row-wise
  for (let r = 0; r < size; r++) {
    let os = 0;
    let xs = 0;
    for (let c = 0; c < size; c++) {
      const value = getValueAt(r, c);
      if (value === x_player) {
        xs += 1;
      } else if (value === o_player) {
        os += 1;
      }
    }

    if (xs === 0) {
      if (os === 1) {
        o1 += 1;
      } else if (os === 2) {
        o2 += 1;
      } else if (os === 3) {
        o3 += 1;
      }
    }

    if (os === 0) {
      if (xs === 1) {
        x1 += 1;
      } else if (xs === 2) {
        x2 += 1;
      } else if (xs === 3) {
        x3 += 1;
      }
    }
  }

  // Check column-wise
  for (let c = 0; c < size; c++) {
    let os = 0;
    let xs = 0;
    for (let r = 0; r < size; r++) {
      const value = getValueAt(r, c);
      if (value === x_player) {
        xs += 1;
      } else if (value === o_player) {
        os += 1;
      }
    }

    if (xs === 0) {
      if (os === 1) {
        o1 += 1;
      } else if (os === 2) {
        o2 += 1;
      } else if (os === 3) {
        o3 += 1;
      }
    }

    if (os === 0) {
      if (xs === 1) {
        x1 += 1;
      } else if (xs === 2) {
        x2 += 1;
      } else if (xs === 3) {
        x3 += 1;
      }
    }
  }

  // Check main diagonal
  let os = 0;
  let xs = 0;
  for (let i = 0; i < size; i++) {
    const value = getValueAt(i, i);
    if (value === x_player) {
      xs += 1;
    } else if (value === o_player) {
      os += 1;
    }
  }

  if (xs === 0) {
    if (os === 1) {
      o1 += 1;
    } else if (os === 2) {
      o2 += 1;
    } else if (os === 3) {
      o3 += 1;
    }
  }

  if (os === 0) {
    if (xs === 1) {
      x1 += 1;
    } else if (xs === 2) {
      x2 += 1;
    } else if (xs === 3) {
      x3 += 1;
    }
  }

  // Check anti-diagonal
  os = 0;
  xs = 0;
  for (let i = 0; i < size; i++) {
    const value = getValueAt(size - i - 1, i);
    if (value === x_player) {
      xs += 1;
    } else if (value === o_player) {
      os += 1;
    }
  }

  if (xs === 0) {
    if (os === 1) {
      o1 += 1;
    } else if (os === 2) {
      o2 += 1;
    } else if (os === 3) {
      o3 += 1;
    }
  }

  if (os === 0) {
    if (xs === 1) {
      x1 += 1;
    } else if (xs === 2) {
      x2 += 1;
    } else if (xs === 3) {
      x3 += 1;
    }
  }

  return 6 * o3 + 3 * o2 + o1 - (6 * x3 + 3 * x2 + x1);
}

addEventListener('message', ({ data }) => {
  minimaxTime = data.time;
  const response = { move: findBestMove(data.grid) };
  postMessage(response);
});
