// MazeRun-script.js - Enhanced with level progression system

// Legacy layouts for backward compatibility
const LAYOUTS = {
  easy: MAZE_LEVELS.easy[1].layout,    // Use Easy Level 2 as default easy
  medium: MAZE_LEVELS.medium[0].layout, // Use Medium Level 1 as default medium  
  hard: MAZE_LEVELS.hard[0].layout     // Use Hard Level 1 as default hard
};

const mazeEl = document.getElementById('maze');
const layoutSelect = document.getElementById('layoutSelect');
const resetBtn = document.getElementById('resetBtn');
const messageEl = document.getElementById('message');
const timerEl = document.getElementById('timer');
const trailLenEl = document.getElementById('trailLen');
const levelInfoEl = document.getElementById('levelInfo');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const prevLevelBtn = document.getElementById('prevLevelBtn');

let grid=[], rows=0, cols=0;
let running=false, started=false;
let startCell=null, exitCell=null;
let visited=[], visitedSet=new Set();
let startTime=0, rafTimer=null;
let lastPointer=null;
let gameMode = 'classic'; // 'classic' or 'progression'
let hasMovedFromStart = false; // Flag to prevent immediate win
let currentMouseX = 0, currentMouseY = 0; // Track mouse position

function buildMaze(layoutName){
  let layout;
  
  if (gameMode === 'progression') {
    const currentLevel = LevelManager.getCurrentLevel();
    if (currentLevel) {
      layout = currentLevel.layout;
      updateLevelInfo();
    } else {
      // Fallback to classic mode
      layout = LAYOUTS[layoutName];
    }
  } else {
    // Classic mode - use old system
    layout = LAYOUTS[layoutName];
  }

  if (!layout) return;
  
  rows=layout.length; cols=layout[0].length;
  mazeEl.style.gridTemplateRows=`repeat(${rows}, var(--cell))`;
  mazeEl.style.gridTemplateColumns=`repeat(${cols}, var(--cell))`;
  mazeEl.innerHTML=''; grid=[]; startCell=null; exitCell=null;

  for(let r=0;r<rows;r++){
    grid[r]=[];
    for(let c=0;c<cols;c++){
      const ch=layout[r][c];
      const el=document.createElement('div');
      el.classList.add('cell'); el.dataset.r=r; el.dataset.c=c;
      if(ch==='#') el.classList.add('wall');
      else if(ch==='.') el.classList.add('path');
      else if(ch==='S'){ el.classList.add('start'); el.dataset.start='1'; startCell=el;}
      else if(ch==='E'){ el.classList.add('exit'); el.dataset.exit='1'; exitCell=el;}
      mazeEl.appendChild(el); grid[r][c]=el;
    }
  }
  resetState();
}

function resetState(){
  running=false; started=false;
  visited=[]; visitedSet=new Set(); lastPointer=null;
  startTime=0; cancelAnimationFrame(rafTimer);
  timerEl.textContent='0.000'; trailLenEl.textContent='0';
  messageEl.style.display='none';
  hasMovedFromStart = false; // Reset the movement flag
  document.querySelectorAll('.cell').forEach(el=>el.classList.remove('visited'));
}

function showMessage(text){ messageEl.textContent=text; messageEl.style.display='flex'; }
function hideMessage(){ messageEl.style.display='none'; }

function startGame(){
  if(!startCell || !exitCell) return;
  
  // Check if mouse cursor is on the start cell before starting
  const elementUnderMouse = document.elementFromPoint(currentMouseX, currentMouseY)?.closest('.cell');
  
  // Only start if cursor is on the start cell
  if(!elementUnderMouse || !elementUnderMouse.dataset.start) {
    showMessage('Move cursor to START to begin!');
    setTimeout(hideMessage, 1500);
    return;
  }
  
  resetState(); started=true; running=true;
  addVisit(startCell);
  startTime=performance.now(); tickTimer();
}

function tickTimer(){
  if(!running) return;
  timerEl.textContent=((performance.now()-startTime)/1000).toFixed(3);
  rafTimer=requestAnimationFrame(tickTimer);
}

function endGame(win){
  running=false; 
  if (win) {
    if (gameMode === 'progression') {
      const nextLevel = LevelManager.getNextLevel();
      if (nextLevel) {
        showMessage(`Level Complete! Next: ${nextLevel.name}`);
      } else {
        showMessage('🎉 All Levels Complete! 🎉');
      }
    } else {
      showMessage('You Win!');
    }
  } else {
    showMessage('Game Over');
  }
  setTimeout(resetState,1200);
}

function addVisit(cell){
  const key=`${cell.dataset.r},${cell.dataset.c}`;
  if(visitedSet.has(key)){
    const idx=visited.findIndex(el=>`${el.dataset.r},${el.dataset.c}`===key);
    if(idx!==-1){ for(let i=visited.length-1;i>idx;i--){ const rem=visited.pop(); visitedSet.delete(`${rem.dataset.r},${rem.dataset.c}`); rem.classList.remove('visited');}}
    trailLenEl.textContent=visited.length; return;
  }
  visited.push(cell); visitedSet.add(key); cell.classList.add('visited'); trailLenEl.textContent=visited.length;
}

function samplePathAndProcess(lastPt, cx, cy){
  const dx=cx-lastPt.x, dy=cy-lastPt.y;
  const dist=Math.hypot(dx,dy);
  const steps=Math.max(1,Math.floor(dist/6));
  for(let i=1;i<=steps;i++){
    const t=i/steps, sx=Math.round(lastPt.x+dx*t), sy=Math.round(lastPt.y+dy*t);
    const el=document.elementFromPoint(sx,sy)?.closest('.cell');
    if(!el) continue;
    if(el.classList.contains('wall')){ endGame(false); return {stop:true};}
    
    // Check if player has moved away from start before allowing win
    if(el.dataset.exit && hasMovedFromStart){ 
      addVisit(el); 
      endGame(true); 
      return {stop:true};
    }
    
    if(el.classList.contains('path')||el.dataset.start) {
      addVisit(el);
      // Mark that player has moved from start if they're not on start cell
      if(!el.dataset.start) {
        hasMovedFromStart = true;
      }
    }
  }
  return {stop:false};
}

function onPointerMove(e){
  // Always track mouse position
  currentMouseX = e.clientX;
  currentMouseY = e.clientY;
  
  if(!running) return;
  const cx=e.clientX, cy=e.clientY;
  if(!lastPointer) lastPointer={x:cx,y:cy};
  const res=samplePathAndProcess(lastPointer,cx,cy); lastPointer={x:cx,y:cy};
  if(res.stop) lastPointer=null;
}

// Level management functions
function updateLevelInfo() {
  if (levelInfoEl) {
    const info = LevelManager.getLevelInfo();
    if (info.level) {
      levelInfoEl.textContent = `${info.difficulty.toUpperCase()} ${info.levelNumber}/${info.totalLevels}: ${info.level.name}`;
    }
  }
  
  // Update navigation buttons
  if (nextLevelBtn) {
    nextLevelBtn.disabled = !LevelManager.getNextLevel();
  }
  
  if (prevLevelBtn) {
    const canGoPrev = LevelManager.currentLevelIndex > 0 || 
                     LevelManager.getDifficulties().indexOf(LevelManager.currentDifficulty) > 0;
    prevLevelBtn.disabled = !canGoPrev;
  }
}

function nextLevel() {
  if (LevelManager.advanceToNextLevel()) {
    buildMaze();
  }
}

function prevLevel() {
  const difficulties = LevelManager.getDifficulties();
  const currentDiffIndex = difficulties.indexOf(LevelManager.currentDifficulty);
  
  if (LevelManager.currentLevelIndex > 0) {
    LevelManager.currentLevelIndex--;
  } else if (currentDiffIndex > 0) {
    const prevDifficulty = difficulties[currentDiffIndex - 1];
    const prevLevels = LevelManager.getLevelsForDifficulty(prevDifficulty);
    LevelManager.setCurrentLevel(prevDifficulty, prevLevels.length - 1);
  }
  
  buildMaze();
}

function toggleGameMode() {
  gameMode = gameMode === 'classic' ? 'progression' : 'classic';
  
  if (gameMode === 'progression') {
    // Initialize level manager
    LevelManager.setCurrentLevel('easy', 0);
  }
  
  buildMaze();
  updateModeUI();
}

function updateModeUI() {
  const modeToggle = document.getElementById('modeToggle');
  const levelControls = document.getElementById('levelControls');
  const classicControls = document.getElementById('classicControls');
  
  if (modeToggle) {
    modeToggle.textContent = gameMode === 'classic' ? 'Level Mode' : 'Classic Mode';
  }
  
  if (levelControls) {
    levelControls.style.display = gameMode === 'progression' ? 'flex' : 'none';
  }
  
  if (classicControls) {
    classicControls.style.display = gameMode === 'classic' ? 'flex' : 'none';
  }
}

window.addEventListener('keydown',e=>{ if(e.code==='Space'){ e.preventDefault(); if(!running) startGame();}});
document.addEventListener('mousemove',onPointerMove);
document.addEventListener('touchmove',ev=>{ 
  ev.preventDefault(); 
  const t=ev.touches[0]; 
  if(t) {
    // Update mouse position for touch
    currentMouseX = t.clientX;
    currentMouseY = t.clientY;
    if(running) onPointerMove(t);
  }
},{passive:false});
resetBtn.addEventListener('click',()=>buildMaze(layoutSelect.value));
layoutSelect.addEventListener('change',()=>buildMaze(layoutSelect.value));
window.addEventListener('blur',()=>{ if(running) endGame(false); });
messageEl.addEventListener('click',()=>{ resetState(); hideMessage(); });
document.addEventListener('keydown', e=>{ if(e.key==='r'||e.key==='R') buildMaze(layoutSelect.value); });

// Add event listeners for new level controls
if (nextLevelBtn) {
  nextLevelBtn.addEventListener('click', nextLevel);
}

if (prevLevelBtn) {
  prevLevelBtn.addEventListener('click', prevLevel);
}

const modeToggle = document.getElementById('modeToggle');
if (modeToggle) {
  modeToggle.addEventListener('click', toggleGameMode);
}

const resetBtn2 = document.getElementById('resetBtn2');
if (resetBtn2) {
  resetBtn2.addEventListener('click', () => buildMaze());
}

// Enhanced win condition for progression mode
const originalEndGame = endGame;
function endGameWithProgression(win) {
  if (win && gameMode === 'progression') {
    setTimeout(() => {
      if (LevelManager.getNextLevel()) {
        // Auto-advance to next level after a delay
        setTimeout(() => {
          LevelManager.advanceToNextLevel();
          buildMaze();
        }, 2000);
      }
    }, 1200);
  }
  originalEndGame(win);
}

// Replace the endGame function
endGame = endGameWithProgression;

// Initialize the game
buildMaze(layoutSelect.value);
updateModeUI();
