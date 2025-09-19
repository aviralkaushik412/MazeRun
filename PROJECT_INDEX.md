# MazeGame Project Index

## Project Overview
**MazeRun — Mouse Trail Edition** is a browser-based maze game where players navigate from start to exit by moving their mouse cursor through maze paths, avoiding walls. The game features multiple difficulty levels, real-time timer, and visual trail tracking.

## Project Structure
```
MazeGame/
├── indexMain.html    # Main HTML page and game container
├── script.js         # Core game logic and functionality
├── style.css         # Visual styling and responsive design
└── PROJECT_INDEX.md  # This index file
```

## File Analysis

### 📄 indexMain.html
**Purpose:** Main HTML structure and game interface
**Key Components:**
- Game title and controls panel
- Difficulty selector (Easy/Medium/Hard)
- Reset button and keyboard instructions
- Maze container with overlay for messages
- HUD (Heads-Up Display) showing timer and trail length
- Responsive viewport meta tag

**DOM Elements:**
- `#maze` - Main maze grid container
- `#layoutSelect` - Difficulty level dropdown
- `#resetBtn` - Game reset button
- `#message` - Game status overlay (win/lose messages)
- `#timer` - Real-time game timer display
- `#trailLen` - Current trail length counter

### ⚙️ script.js
**Purpose:** Core game engine and interaction logic
**Key Features:**

#### Maze Layouts
- **Easy**: 11×9 grid with simple paths
- **Medium**: 13×9 grid with moderate complexity
- **Hard**: 17×11 grid with complex pathways
- Layout format: `#` = wall, `.` = path, `S` = start, `E` = exit

#### Game State Management
- `running`: Game active status
- `started`: Game initialization flag
- `visited[]`: Array tracking visited cells
- `visitedSet`: Set for efficient lookup of visited cells
- `startTime`: Game start timestamp for timer

#### Core Functions
1. **`buildMaze(layoutName)`** - Constructs maze from layout string
2. **`startGame()`** - Initializes game state and timer
3. **`endGame(win)`** - Handles win/lose scenarios
4. **`addVisit(cell)`** - Tracks cell visits and manages trail
5. **`samplePathAndProcess()`** - Collision detection along mouse path
6. **`onPointerMove()`** - Handles mouse/touch movement
7. **`tickTimer()`** - Updates game timer display

#### Input Handling
- **Mouse Movement**: Primary navigation method
- **Touch Support**: Mobile device compatibility
- **Keyboard**: Space to start, R to reset
- **Window Blur**: Auto-pause on focus loss

#### Trail System
- Visual feedback showing visited path
- Backtracking support (removes trail segments)
- Real-time length counter
- Smart path sampling for smooth detection

### 🎨 style.css
**Purpose:** Visual design and responsive layout
**Design Features:**

#### CSS Variables
```css
--cell: 28px         # Cell size
--gap: 3px           # Grid gap
--wall: #222         # Wall color
--path: #eee         # Path color
--trail: #2b7be4     # Trail color
--start: #8be28b     # Start cell color
--exit: #ffd166      # Exit cell color
```

#### Visual Elements
- **Dark Theme**: Gradient background (#0f172a to #071029)
- **Modern Typography**: Inter font family
- **Rounded Corners**: 6-12px border radius throughout
- **Grid Layout**: CSS Grid for maze structure
- **Trail Animation**: Semi-transparent background with solid trail dots
- **Responsive Design**: Smaller cells on mobile (max-width: 520px)

#### Layout Components
- Centered application container
- Flexbox controls panel
- Overlay message system
- HUD with game statistics
- Mobile-optimized touch targets

## Game Mechanics

### Gameplay Flow
1. **Initialization**: Select difficulty and press Space
2. **Navigation**: Move mouse from green start to yellow exit
3. **Trail Tracking**: Blue trail shows visited path
4. **Collision Detection**: Touching walls ends game
5. **Backtracking**: Revisiting cells removes later trail segments
6. **Victory**: Reaching exit displays win message
7. **Auto-Reset**: Game resets after 1.2 seconds

### Technical Features
- **Path Sampling**: Interpolates mouse movement for smooth detection
- **Performance Optimization**: RequestAnimationFrame for timer updates
- **Cross-Platform**: Mouse and touch event support
- **Accessibility**: ARIA labels and keyboard navigation
- **Error Handling**: Graceful handling of edge cases

### Difficulty Scaling
- **Easy**: 11×9 grid, wide paths, minimal dead ends
- **Medium**: 13×9 grid, moderate complexity, selected by default
- **Hard**: 17×11 grid, narrow paths, complex branching

## Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Support**: Touch events for smartphones/tablets
- **CSS Grid**: Required for layout (IE11+ support needed)
- **ES6 Features**: Arrow functions, const/let, template literals

## Development Notes
- **No Dependencies**: Pure HTML/CSS/JavaScript
- **Modular Design**: Clear separation of concerns
- **Event-Driven**: Responsive to user interactions
- **Performance Conscious**: Efficient collision detection and rendering
- **Maintainable**: Well-structured code with clear function responsibilities

## Future Enhancement Opportunities
- Sound effects and background music
- Level progression system
- Local storage for best times
- Custom maze editor
- Multiplayer competition mode
- Additional maze generation algorithms
- Particle effects for trail visualization

---
*Generated on: September 19, 2025*
*Project Type: Browser Game*
*Framework: Vanilla JavaScript*