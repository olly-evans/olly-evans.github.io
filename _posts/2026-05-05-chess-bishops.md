---
title: Getting Pseudo-Legal Bishop Moves
date: 2026-05-05 13:05:00
categories: [programming, chess, projects]
tags: [c++, chess, gui, oop, rook] # Tag names always lowercase.
permalink: /chess-bishops/
---

You might be wondering why I called this post getting bishops pseudo legal moves and not just getting their legal moves. This is because of king checks and the resulting pin situations, which my next post will be on. 

Pins are a board position whereby a piece cannot move due to an enemy piece threatening an attack on its king should it move. As shown below.

<img src="/assets/img/chess/pin_example.png" alt="Black Queen pins the white knight." width="300" height="300">

As can be seen the black queen is pinning the white knight to the white king. As of right now if I were to use my `get_legal_moves()` algorithm for a knight there would be multiple 'legal' moves when in actual fact it doesn't have any because if it does move then the white king would be in check. Which cannot happen in chess.

This method of getting the legal moves for all pieces will thus not take pins and kings checks into account and will be addressed in a future post where I will probably modify this code slightly. Onward!

## Bishops

I've taken the bishop as an example for this post as this is the general structure of how all the legal moves are collected for each piece type just with different offsets.

Bishops slide upon the diagonals in a game of chess. Every piece type has their own overriding implementation of `get_legal_moves()` taking their specific piece rules into account.

This is the code for the bishop, I will walk you through it though it really isn't too difficult to grasp if you have a basic understanding of bitwise operations in C/C++.

```c++

uint64_t Bishop::get_legal_moves(uint64_t w_bb, uint64_t b_bb) {
    uint64_t bishop = (1ULL << this->bit);
    uint64_t moves = 0ULL;

    uint64_t north_west_moves = get_north_west_moves(bishop, w_bb, b_bb);
    uint64_t north_east_moves = get_north_east_moves(bishop, w_bb, b_bb);

    uint64_t south_west_moves = get_south_west_moves(bishop, w_bb, b_bb);
    uint64_t south_east_moves = get_south_east_moves(bishop, w_bb, b_bb);

    moves |= north_west_moves;
    moves |= north_east_moves;
    moves |= south_west_moves;
    moves |= south_east_moves;

    uint64_t enemy = (this->color == Color::WHITE) ? b_bb : w_bb; 
    this->captures = (moves & enemy);

    moves = BBHelper::remove_friendly_pieces(moves, (this->color == Color::WHITE ? w_bb : b_bb)); 
    return BBHelper::remove_enemy_pieces(moves, (this->color == Color::WHITE) ? b_bb : w_bb);
};

```

By using the bit of the current piece `this->bit` we can bitshift an unsigned long long by `this->bit` using the `<<` operator to locate the piece on a bitboard, this is assigned to a temporary `uint64_t` called `bishop`.

A moves variable also an `uint64_t` is assigned 0ULL, we will use the bitwise OR operator to add our legal moves to it as we go through the algorithm.

Next we get the north west moves by passing the rooks position and the white and black occupancy bitboards. There are three other functions that do this in the other three directions we will just be covering this one, it is fairly similar in the others the bit offset is just different.

```c++

uint64_t Piece::get_north_west_moves(uint64_t piece, uint64_t w_bb, uint64_t b_bb) {

    uint64_t north_west_moves = 0ULL;
    const uint8_t north_west_offset = 9;

    uint8_t piece_file = BBHelper::get_piece_file(piece);
    uint8_t move_file;
        
    for (uint8_t i = 0; i < GRID_SZ; i++) {

        // this will be until we hit the end of the board, always 7 if no pieces in the way.
        move_file = piece_file - i;

        if (w_bb & north_west_moves) break;
        if (b_bb & north_west_moves) break;
        if (!(piece << (north_west_offset*i))) break;

         // Stop generating attacks if we get to the far left file.
        if (move_file == 0) break;

        north_west_moves |= (piece << (north_west_offset + (north_west_offset*i)));
    }
    return north_west_moves;
}
```

First off we establish our cumulative `north_west_moves` variable as well as our offset. Moving north west means we are moving 9 bits to the left on a bitboard.

We then get the file of our piece to use later before entering a loop to determine how far we can travel in that direction before hitting an enemy, friendly piece or the end of the board. We first find the file the move is in so we know if we've gone off the board. I want to refactor this right now just looking at it but am resisting the urge, for now we'll leave it as is. I'll change it later when I have to add king checks anyway.

If the move file is the 0th file we can stop generating moves as we've reached the end of the board and can break from the loop. As this function only deals with north west moves we don't have to worry about being in the 7th file.

Making it through all those guards means we can bitwise OR our `north_west_moves` variable with the calculated bit offset shown with `north_west_offset + (north_west_offset*i)` to set the move bit. 

The bitwise or means if we don't have a bit set in `north_west_moves` where the move is we can set it to one (i.e 1001 \| 0001 = 1001).

And after reaching the end of the loop we can return all the moves in the north west direction.

Returning the to the parent function we OR it with the original moves `uint64_t`. To set all those bits much like we did previously. 

```c++
moves |= north_west_moves;
```

We do this for the other three directions and OR with `moves` too to set all the bits with valid moves.

We need to know what color the piece we're moving is so we can identify the potential captures. 

```c++
uint64_t enemy = (this->color == Color::WHITE) ? b_bb : w_bb; 
    this->captures = (moves & enemy);
```

Captures are a public `Piece` member that is set whenever we call `get_legal_moves()` for a piece. This is so we can render the highlights for moves and captures seperately as shown below with the circles and the square fills.

<img src="/assets/img/chess/captures_moves_example.png" alt="Black Queen pins the white knight." width="300" height="300">

This kind of spoils how the bishops movement will look with our new function but chess has been out for a while so you only have yourself to blame at this point.

We assign the captures to `this->captures` using a bitwise AND with the enemy occupancy bitboard and our moves integer. Moves includes the bit where it collides with another piece for now.

As it includes these collisions we need to strip them using a few bitboard helper functions.

```c++
moves = BBHelper::remove_friendly_pieces(moves, (this->color == Color::WHITE ? w_bb : b_bb)); 
    return BBHelper::remove_enemy_pieces(moves, (this->color == Color::WHITE) ? b_bb : w_bb);
```

We find the color of the piece which I am going to change right now into a variable as we use it twice. And then strip the friendly pieces and enemy pieces from the moves `uint64_t` to give us our valid moves.

This stripping is done with an `moves &= ~friendly` or likewise with the enemy occupancy bitboard. Inverting the occupancy bitboard gives us 0s wherever there is a piece of this kind. The bitwise AND then removes these from the moves `uint64_t`.

Hopefully that wasn't too bad but that in summary is how I've dealt with movement so far. The queen also steals this logic which is why the `get_north_west_moves()` function is a `Piece` method not a `Bishop` one. The same applies to the rook.

This is the result of the `get_legal_moves()` function for the `Bishop`. Shown also is the result with just the `get_north_west_moves()` function to show what thats doing. Yes I'm ignoring all the rendering stuff, but that is boring and pretty standard in any GUI library so we'll focus on what makes chess unique and interesting in my opinion.

<div style="display: flex; gap: 16px; justify-content: center;">
    <div style="text-align: center;">
        <img src="/assets/img/chess/bishop_all.png" alt="White rooks bitboard" width="300" height="300">
        <p>Bishop with all moves showing.</p>
    </div>
    <div style="text-align: center;">
        <img src="/assets/img/chess/bishop_nw.png" alt="Black knights bitboard" width="300" height="300">
        <p>Bishop with just north-western moves showing.</p>
    </div>
</div>

In my next post I'll go over king checks.