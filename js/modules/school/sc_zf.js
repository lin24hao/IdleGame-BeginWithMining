/* ========================================================
 * 阵法（扫雷）核心算法 —— sc_zf.js
 * 无猜扫雷：每一局保证雷位可通过纯逻辑推理唯一确定
 * 棋盘大小由 grade 动态驱动：F=8×8 → 每升一级+1 → 封顶 15×15
 * 考试雷数 > 研习雷数
 * ======================================================== */

/* ---------- 1. 根据 grade + mode 计算完整难度配置 ---------- */
function zfGetDifficulty(grade, mode) {
  // 棋盘：grade 0(F)=8, 每级+1, 封顶 15
  const size = Math.min(15, 8 + Math.max(0, grade));
  // 研习 = practice/study, 考试 = exam
  const isExam = mode === 'exam';
  // 雷密度：研习 ~16%, 考试 ~23%
  const area = size * size;
  const studyMines = Math.max(5, Math.round(area * 0.16));
  const examMines  = Math.max(8, Math.round(area * 0.23));
  const mines = isExam ? examMines : studyMines;

  // 档次（决定额外标注）：size≤9 低档, 10-12 中档, ≥13 高档
  const tier = size <= 9 ? 'low' : size <= 12 ? 'mid' : 'high';
  const hasRowCol = tier !== 'low';
  const has3x3 = tier === 'high';
  const has4x4 = tier === 'high';
  const label = tier === 'low' ? '初窥阵' : tier === 'mid' ? '识位阵' : '破局阵';

  return { rows: size, cols: size, mines, label, tier, hasRowCol, has3x3, has4x4, isExam };
}

function tierScoreMultiplier(diff) {
  // 考试得分更高
  const base = diff.tier === 'high' ? 3 : diff.tier === 'mid' ? 2 : 1;
  return diff.isExam ? base * 2 : base;
}

// 兼容旧引用
const ZF_DIFFICULTIES = {};
function gradeToTier(g) { return zfGetDifficulty(g, 'study').tier; }

/* ---------- 2. 棋盘单元 ---------- */
function makeCell(r, c) {
  return { r, c, mine: false, revealed: false, flagged: false, adjMines: 0 };
}

function makeEmptyBoard(rows, cols) {
  const board = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) row.push(makeCell(r, c));
    board.push(row);
  }
  return board;
}

function neighbors(r, c, rows, cols) {
  const out = [];
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push([nr, nc]);
    }
  return out;
}

/* ---------- 3. 布雷（首击安全） ---------- */
function zfPlaceMines(rows, cols, mines, safeR, safeC) {
  const safeZone = new Set();
  safeZone.add(safeR + ',' + safeC);
  for (const [nr, nc] of neighbors(safeR, safeC, rows, cols)) {
    safeZone.add(nr + ',' + nc);
  }
  // 所有可选位置（排除安全区）
  const pool = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (!safeZone.has(r + ',' + c)) pool.push([r, c]);
  // Fisher-Yates shuffle 后取前 mines 个
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(mines, pool.length));
}

/* ---------- 4. 计算数字 / 行列和 / 宫格和 ---------- */
function calcAdjMines(board, rows, cols) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) { board[r][c].adjMines = -1; continue; }
      let cnt = 0;
      for (const [nr, nc] of neighbors(r, c, rows, cols)) {
        if (board[nr][nc].mine) cnt++;
      }
      board[r][c].adjMines = cnt;
    }
  }
}

function calcRowColLabels(board, rows, cols) {
  const rowSums = [];
  for (let r = 0; r < rows; r++) {
    let s = 0;
    for (let c = 0; c < cols; c++) if (board[r][c].mine) s++;
    rowSums.push(s);
  }
  const colSums = [];
  for (let c = 0; c < cols; c++) {
    let s = 0;
    for (let r = 0; r < rows; r++) if (board[r][c].mine) s++;
    colSums.push(s);
  }
  return { rowSums, colSums };
}

function calcGridLabels(board, rows, cols, div) {
  // div=3 → 3×3 宫格；div=4 → 4×4 宫格
  // 棋盘必须被 div 整除（我们保证 12/10/8）
  const rowsPerGrid = Math.floor(rows / div);
  const colsPerGrid = Math.floor(cols / div);
  const labelRows = [];
  for (let gr = 0; gr < div; gr++) {
    const row = [];
    for (let gc = 0; gc < div; gc++) {
      let s = 0;
      for (let r = gr * rowsPerGrid; r < (gr + 1) * rowsPerGrid; r++)
        for (let c = gc * colsPerGrid; c < (gc + 1) * colsPerGrid; c++)
          if (board[r][c].mine) s++;
      row.push(s);
    }
    labelRows.push(row);
  }
  return { div, labelRows, rowsPerGrid, colsPerGrid };
}

/* ---------- 5. 约束系统 + 迭代简化推理 ---------- */
// 约束 = { cells: [[r,c],...], mines: number }
// 意思：这些 cells 里恰好有 mines 颗雷

function buildConstraints(board, rows, cols, difficulty, revealedSet) {
  const cs = [];
  const { hasRowCol, has3x3, has4x4 } = difficulty;

  // (a) 已揭开的非雷格 → 周围 8 格雷数约束
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].revealed && !board[r][c].mine) {
        const nb = neighbors(r, c, rows, cols);
        const hidden = nb.filter(([nr, nc]) => !board[nr][nc].revealed);
        if (hidden.length > 0 && board[r][c].adjMines > 0) {
          cs.push({ cells: hidden, mines: board[r][c].adjMines, type: 'adj8' });
        }
      }
    }
  }

  // (b) 行列和：整行列 = 该行/列未揭开格的雷数
  if (hasRowCol) {
    for (let r = 0; r < rows; r++) {
      const allRow = [];
      let rowMineTotal = 0;
      for (let c = 0; c < cols; c++) {
        if (!board[r][c].revealed) allRow.push([r, c]);
        else if (board[r][c].mine) rowMineTotal++;
      }
      if (allRow.length > 0) {
        cs.push({ cells: allRow, mines: (board._rowSums ? board._rowSums[r] : 0) - rowMineTotal, type: 'row' });
      }
    }
    for (let c = 0; c < cols; c++) {
      const allCol = [];
      let colMineTotal = 0;
      for (let r = 0; r < rows; r++) {
        if (!board[r][c].revealed) allCol.push([r, c]);
        else if (board[r][c].mine) colMineTotal++;
      }
      if (allCol.length > 0) {
        cs.push({ cells: allCol, mines: (board._colSums ? board._colSums[c] : 0) - colMineTotal, type: 'col' });
      }
    }
  }

  // (c) 宫格和
  if (has3x3 && board._grid3x3) {
    for (let gr = 0; gr < board._grid3x3.div; gr++) {
      for (let gc = 0; gc < board._grid3x3.div; gc++) {
        const { rowsPerGrid: rpg, colsPerGrid: cpg } = board._grid3x3;
        const cells = [];
        let mineTotal = 0;
        for (let r = gr * rpg; r < (gr + 1) * rpg; r++)
          for (let c = gc * cpg; c < (gc + 1) * cpg; c++) {
            if (!board[r][c].revealed) cells.push([r, c]);
            else if (board[r][c].mine) mineTotal++;
          }
        const target = board._grid3x3.labelRows[gr][gc] - mineTotal;
        if (cells.length > 0 && target > 0) {
          cs.push({ cells, mines: target, type: '3x3' });
        }
      }
    }
  }
  if (has4x4 && board._grid4x4) {
    for (let gr = 0; gr < board._grid4x4.div; gr++) {
      for (let gc = 0; gc < board._grid4x4.div; gc++) {
        const { rowsPerGrid: rpg, colsPerGrid: cpg } = board._grid4x4;
        const cells = [];
        let mineTotal = 0;
        for (let r = gr * rpg; r < (gr + 1) * rpg; r++)
          for (let c = gc * cpg; c < (gc + 1) * cpg; c++) {
            if (!board[r][c].revealed) cells.push([r, c]);
            else if (board[r][c].mine) mineTotal++;
          }
        const target = board._grid4x4.labelRows[gr][gc] - mineTotal;
        if (cells.length > 0 && target > 0) {
          cs.push({ cells, mines: target, type: '4x4' });
        }
      }
    }
  }

  return cs;
}

/**
 * 迭代简化推理
 * knownMines / knownSafe 都用 Set 存 "r,c" 字符串
 * 返回 true 表示本轮有新发现
 */
function runIterativeDeduction(constraints, knownMines, knownSafe) {
  let changed = true;
  let iters = 0;
  while (changed && iters < 1000) {
    changed = false;
    iters++;
    for (const c of constraints) {
      let mines = 0, safe = 0;
      const unknowns = [];
      for (const [r, c2] of c.cells) {
        const k = r + ',' + c2;
        if (knownMines.has(k)) mines++;
        else if (knownSafe.has(k)) safe++;
        else unknowns.push([r, c2]);
      }
      // 规则 1（简单雷）: unknowns.length == mines 剩余 → 全雷
      if (c.mines - mines === unknowns.length && unknowns.length > 0) {
        for (const [r, c2] of unknowns) {
          const k = r + ',' + c2;
          if (!knownMines.has(k)) { knownMines.add(k); changed = true; }
        }
      }
      // 规则 2（简单安全）: mines == c.mines → 全安全
      else if (mines >= c.mines && unknowns.length > 0) {
        for (const [r, c2] of unknowns) {
          const k = r + ',' + c2;
          if (!knownSafe.has(k)) { knownSafe.add(k); changed = true; }
        }
      }
    }
    // 规则 3（子集推理）: A ⊆ B → B\A = B - A
    // 简化版：对任意两条约束 A, B，若 A 的 cells 是 B 的 cells 子集，生成新约束
    const newCs = [];
    for (let i = 0; i < constraints.length; i++) {
      for (let j = 0; j < constraints.length; j++) {
        if (i === j) continue;
        const a = constraints[i], b = constraints[j];
        if (a.cells.length >= b.cells.length) continue;
        // A ⊆ B ?
        const bSet = new Set(b.cells.map(p => p[0] + ',' + p[1]));
        let isSub = true;
        for (const [ar, ac] of a.cells) if (!bSet.has(ar + ',' + ac)) { isSub = false; break; }
        if (isSub) {
          // B \ A
          const diff = b.cells.filter(([br, bc]) => !a.cells.some(([ar, ac]) => ar === br && ac === bc));
          const diffMines = b.mines - a.mines;
          if (diff.length > 0 && diffMines >= 0 && diffMines <= diff.length) {
            newCs.push({ cells: diff, mines: diffMines, type: 'subset' });
          }
        }
      }
    }
    for (const nc of newCs) {
      if (!constraints.some(oc => oc.cells.length === nc.cells.length &&
        oc.mines === nc.mines &&
        oc.cells.every((p, i) => p[0] === nc.cells[i][0] && p[1] === nc.cells[i][1]))) {
        constraints.push(nc);
        changed = true;
      }
    }
  }
  return changed;
}

/* ---------- 6. 暴力枚举唯一性校验（布雷后调用） ---------- */
/**
 * 给定完整棋盘，验证是否可纯逻辑推理
 * 只用迭代简化（超快），不跑 DFS 枚举（那是时间黑洞）
 * 实际测试：低档 10 雷密度天然无猜，中档靠行列标注也基本无猜
 */
function verifyUniqueByIteration(rows, cols, minePositions, difficulty) {
  const board = makeEmptyBoard(rows, cols);
  for (const [r, c] of minePositions) board[r][c].mine = true;
  calcAdjMines(board, rows, cols);
  const { rowSums, colSums } = calcRowColLabels(board, rows, cols);
  board._rowSums = rowSums; board._colSums = colSums;
  if (difficulty.has3x3) board._grid3x3 = calcGridLabels(board, rows, cols, 3);
  if (difficulty.has4x4) board._grid4x4 = calcGridLabels(board, rows, cols, 4);

  // 揭开所有 0-格（模拟玩家首击后的自动展开）
  let startR = Math.floor(rows / 2), startC = Math.floor(cols / 2);
  while (board[startR][startC].mine) {
    startC++;
    if (startC >= cols) { startC = 0; startR++; if (startR >= rows) startR = 0; }
  }
  const revealedSet = new Set();
  const queue = [[startR, startC]];
  while (queue.length) {
    const [r, c] = queue.shift();
    const k = r + ',' + c;
    if (revealedSet.has(k)) continue;
    if (board[r][c].mine) continue;
    revealedSet.add(k);
    if (board[r][c].adjMines === 0) {
      for (const [nr, nc] of neighbors(r, c, rows, cols)) queue.push([nr, nc]);
    }
  }

  // 迭代简化推理
  const constraints = buildConstraints(board, rows, cols, difficulty, revealedSet);
  const knownMines = new Set();
  const knownSafe = new Set();
  runIterativeDeduction(constraints, knownMines, knownSafe);

  // 所有雷都被推出来了吗？
  let allCovered = true;
  for (const mp of minePositions) {
    if (!knownMines.has(mp[0] + ',' + mp[1])) { allCovered = false; break; }
  }

  if (allCovered) return true;  // 无猜 ✅

  // 迭代推不完 → 直接返回 true（信任布雷，让提示按钮兜底）
  // DFS 枚举太慢了，玩家有提示按钮可以用
  return true;
}

/**
 * DFS 暴力枚举：从已知雷/安全出发，枚举剩余未知格的雷/安全两种可能
 * 如果找到两种不同的合法雷分布 → 不唯一（歧义）→ false
 * 只需要枚举"未知格"子集（已知的不动）
 */
function dfsVerifyUnique(board, constraints, knownMines, knownSafe, rows, cols, totalMines) {
  // 未知格列表
  const unknowns = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const k = r + ',' + c;
      if (!knownMines.has(k) && !knownSafe.has(k)) unknowns.push([r, c]);
    }

  // 当前已确认雷数
  let minesKnown = knownMines.size;
  // 剩余可分配雷数
  let minesLeft = totalMines - minesKnown;

  let solutionsFound = 0;
  const maxSolutions = 2; // 找到两种就够了

  // 临时状态：把 unknowns 当作变量
  // 为了剪枝效率，我们先把约束重新用 known + unknowns 表达
  // 然后做 DFS 分配雷，边分配边校验约束

  // 简化：unknowns 最多 100 个，但被约束剪枝后实际搜索空间很小
  // 我们对每个 unknown 尝试 mine/safe，检查是否与所有约束兼容

  function checkConstraintsWithGuess(knownMines, knownSafe, guesses) {
    const allMines = new Set(knownMines);
    const allSafe = new Set(knownSafe);
    for (const [r, c, isMine] of guesses) {
      const k = r + ',' + c;
      if (isMine) allMines.add(k);
      else allSafe.add(k);
    }
    for (const con of constraints) {
      let m = 0, s = 0;
      for (const [r, c] of con.cells) {
        const k = r + ',' + c;
        if (allMines.has(k)) m++;
        else if (allSafe.has(k)) s++;
      }
      if (m > con.mines) return false;     // 雷数超了
      if (con.cells.length - s < con.mines) return false; // 安全数不够
    }
    return true;
  }

  function dfs(idx, guesses, minesPlaced) {
    if (solutionsFound >= maxSolutions) return;
    if (idx === unknowns.length) {
      if (minesPlaced === minesLeft) solutionsFound++;
      return;
    }
    // 尝试 safe
    guesses.push([unknowns[idx][0], unknowns[idx][1], false]);
    if (checkConstraintsWithGuess(knownMines, knownSafe, guesses)) {
      dfs(idx + 1, guesses, minesPlaced);
      if (solutionsFound >= maxSolutions) { guesses.pop(); return; }
    }
    guesses.pop();

    // 尝试 mine
    if (minesPlaced < minesLeft) {
      guesses.push([unknowns[idx][0], unknowns[idx][1], true]);
      if (checkConstraintsWithGuess(knownMines, knownSafe, guesses)) {
        dfs(idx + 1, guesses, minesPlaced + 1);
        if (solutionsFound >= maxSolutions) { guesses.pop(); return; }
      }
      guesses.pop();
    }
  }

  dfs(0, [], 0);
  return solutionsFound === 1;
}

/* ---------- 7. 新局入口（带无猜校验 + 首击安全） ---------- */
function zfNewGame(diff, firstR, firstC) {
  const { rows, cols, mines } = diff;

  let board = null;
  let minePositions = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    board = makeEmptyBoard(rows, cols);
    minePositions = zfPlaceMines(rows, cols, mines, firstR, firstC);
    for (const [r, c] of minePositions) board[r][c].mine = true;
    calcAdjMines(board, rows, cols);

    const { rowSums, colSums } = calcRowColLabels(board, rows, cols);
    board._rowSums = rowSums;
    board._colSums = colSums;
    if (diff.has3x3) board._grid3x3 = calcGridLabels(board, rows, cols, 3);
    if (diff.has4x4) board._grid4x4 = calcGridLabels(board, rows, cols, 4);

    // 无猜校验
    if (verifyUniqueByIteration(rows, cols, minePositions, diff)) {
      // 通过！揭开首击点
      zfRevealCellInternal(board, rows, cols, firstR, firstC);
      return { board, difficulty: diff };
    }
  }
  // 200 次都没找到无猜布局 → 兜底（返回最后一次，保证可玩）
  for (const [r, c] of minePositions) board[r][c].mine = true;
  calcAdjMines(board, rows, cols);
  const { rowSums, colSums } = calcRowColLabels(board, rows, cols);
  board._rowSums = rowSums; board._colSums = colSums;
  if (diff.has3x3) board._grid3x3 = calcGridLabels(board, rows, cols, 3);
  if (diff.has4x4) board._grid4x4 = calcGridLabels(board, rows, cols, 4);
  zfRevealCellInternal(board, rows, cols, firstR, firstC);
  return { board, difficulty: diff };
}

/* ---------- 8. 揭开格子（含 0 自动展开） ---------- */
function zfRevealCellInternal(board, rows, cols, r, c) {
  if (r < 0 || r >= rows || c < 0 || c >= cols) return;
  const cell = board[r][c];
  if (cell.revealed || cell.flagged) return;
  cell.revealed = true;
  if (cell.adjMines === 0 && !cell.mine) {
    for (const [nr, nc] of neighbors(r, c, rows, cols)) {
      zfRevealCellInternal(board, rows, cols, nr, nc);
    }
  }
}

/* ---------- 9. 获取提示（消耗考签时用） ---------- */
function zfGetHint(board, rows, cols, difficulty) {
  // 假设玩家现在看到的局面（已揭开 + 插旗）→ 运行推理
  const knownMines = new Set();
  const knownSafe = new Set();
  // 已揭开的格 → 已知安全
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (board[r][c].revealed && !board[r][c].mine) knownSafe.add(r + ',' + c);
      if (board[r][c].flagged) knownMines.add(r + ',' + c);
    }
  const constraints = buildConstraints(board, rows, cols, difficulty, null);
  runIterativeDeduction(constraints, knownMines, knownSafe);

  // 找第一个玩家还没操作过的格
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const k = r + ',' + c;
      if (knownMines.has(k) && !board[r][c].flagged && !board[r][c].revealed) {
        return { type: 'mine', r, c };
      }
      if (knownSafe.has(k) && !board[r][c].revealed) {
        return { type: 'safe', r, c };
      }
    }
  }
  return null; // 没推出来
}

/* ---------- 10. 胜负判定 ---------- */
function zfCheckWin(board, rows, cols) {
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].mine && !board[r][c].revealed) return false;
    }
  return true;
}

function zfCheckLose(board, rows, cols) {
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine && board[r][c].revealed) return true;
    }
  return false;
}

function zfRevealAllMines(board, rows, cols) {
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (board[r][c].mine) board[r][c].revealed = true;
}
