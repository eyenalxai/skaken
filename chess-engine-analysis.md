# Chess Engine Architectural Analysis

## Core Issues

### 1. Game State Mutation
The `ChessGame` class has inconsistent mutation patterns:
- Tries to be immutable in some places
- Directly mutates state in `makeMove`
- Should either embrace immutability fully or be explicitly mutable

### 2. Move Validation Complexity
Move validation logic is overly complex:
- Spread across multiple functions
- Has many nested conditions
- `getValidMoves` handles too many responsibilities:
  - Piece movement
  - Special moves
  - Check validation

### 3. Type Safety Gaps
Despite TypeScript usage, type safety is bypassed in several places:
- Square type doesn't prevent invalid squares for different board sizes
- Piece type allows invalid combinations
- FEN parsing could return invalid states despite types suggesting otherwise

### 4. Inconsistent Error Handling
Multiple different error handling approaches:
- Throwing errors (in FEN parsing)
- Returning null (in some move validations) 
- Returning false (in makeMove)
- Using toast notifications (in UI layer) 

### 5. State Management Confusion
Unclear relationship between:
- `ChessGame`
- `GameState`
- React state in `useChessGame`

State management is split between these three with overlapping responsibilities.

### 6. Tight Coupling
Move generation is tightly coupled with board representation:
- Adding new piece types requires changes across multiple files
- Changing piece movement rules affects multiple components
- No clear abstraction for "piece behavior"

### 7. Missing Abstractions
No clear abstractions for:
- Board representation (just raw 2D array)
- Move rules (mixed with move generation)
- Game rules (scattered across different files)
- Position evaluation (tightly coupled with specific piece types)

### 8. Inflexible Design
Despite supporting variable board sizes, engine is hardcoded to chess-specific concepts:
- Piece types are fixed
- Castle rules are chess-specific
- Promotion rules are hardcoded
- Check/checkmate logic assumes chess rules 