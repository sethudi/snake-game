
import React, {useEffect, useState} from 'react';
import {randomIntFromInterval,useInterval} from '../lib/utils.js';
import './Board.css';



class LinkedListNode {
    constructor(value){
        this.value =value;
        this.next =null;
    }
}

class LinkedList {
    constructor(value){
        const node = new LinkedListNode(value);
        this.head = node;
        this.tail = node;
    }
}


const Direction ={
    UP:'UP',
    RIGHT:'RIGHT',
    DOWN:'DOWN',
    LEFT:'LEFT',
};

const BOARD_SIZE =15;
const STARTING_FOOD_CELL =48;


const getStartingSnakeLLValue = (board) => {
    const rowSize = board.length;
    const colSize = board[0].length;
    const startingRow = Math.round(rowSize / 3);
    const startingCol = Math.round(colSize / 3);
    const startingCell = board[startingRow][startingCol];
    return {
        row: startingRow,
        col: startingCol,
        cell: startingCell,
    }
}

    const Board = () =>{
        const [score, setScore] = useState(0);
        const [board] = useState(createBoard(BOARD_SIZE));
        
        const [snake, setSnake] =useState(new LinkedList(getStartingSnakeLLValue(board)));
        const [snakeCells, setSnakeCells] = useState(new Set([snake.head.value.cell]));
        const [foodCell,setFoodCell] = useState(snake.head.value.cell +5);
        const [direction, setDirection] = useState(Direction.RIGHT);
    

    useEffect(() => {
        const handleKeydown =(e) => {
            const newDirection = getDirectionFromKey(e.key);
            const isValidDirection = newDirection !== '';
            if (!isValidDirection) return;
            setDirection(newDirection);
            }

        window.addEventListener('keydown', e => {
            handleKeydown(e);
            });
    }, []);

    useInterval(()=>{
        moveSnake();
    }, 200);

    

    const moveSnake = () => {
        const currentHeadCoords = {
            row: snake.head.value.row,
            col: snake.head.value.col,
        };
        const nextHeadCoords = getNextSnakeHeadCoords(currentHeadCoords, direction);

        if (isOutOfBounds(nextHeadCoords, board)) {
            HandleGameOver();
            return;
        }
        const nextHeadCell = board[nextHeadCoords.row][nextHeadCoords.col];

        if (snakeCells.has(nextHeadCell)) {
            HandleGameOver();
            return;
        }

        const newHead =new LinkedListNode({
            row:nextHeadCoords.row, 
            col:nextHeadCoords.col, 
            cell:nextHeadCell});

        const newSnakeCells = new Set(snakeCells);
        newSnakeCells.delete(snake.tail.value.cell);
        newSnakeCells.add(nextHeadCell);

        const currentHead = snake.head;
        snake.head = newHead;
        currentHead.next = newHead;

        snake.tail = snake.tail.next;
        if (snake.tail === null) snake.tail = snake.head;

        if (nextHeadCell === foodCell) {
            handleFoodConsumption()
            growSnake(newSnakeCells)
        }
        else{
            setSnakeCells(newSnakeCells)
        }

    };

    const getNextSnakeHeadCoords = (currentSnakeHead, direction) => {
        if (direction === Direction.UP){
            return {
                row: currentSnakeHead.row -1,
                col: currentSnakeHead.col,
            };
        }
        if (direction === Direction.RIGHT){
            return {
                row: currentSnakeHead.row,
                col: currentSnakeHead.col + 1,
            };
        }
        if (direction === Direction.DOWN){
            return {
                row: currentSnakeHead.row + 1,
                col: currentSnakeHead.col ,
            };
        }
        if (direction === Direction.LEFT){
            return {
                row: currentSnakeHead.row ,
                col: currentSnakeHead.col - 1,
            };
        }
    };
    const HandleGameOver = () =>{
        setScore(0);
        const snakeLLStartingValue = getStartingSnakeLLValue(board);
        setSnake(new LinkedList(snakeLLStartingValue));
        setFoodCell(STARTING_FOOD_CELL +5);
        setSnakeCells(new Set([snakeLLStartingValue.cell]));
        setDirection(Direction.RIGHT);
    };

    const growSnake = (newSnakeCells) =>{
        
        const growthNodeCoords = getGrowthNodeCoords(snake.tail, direction);
        if (isOutOfBounds(growthNodeCoords, board)){
            return;
        } 
        const newTailCell = board[growthNodeCoords.row][growthNodeCoords.col];
        const newTail = new LinkedListNode({
            row: growthNodeCoords.row,
            col: growthNodeCoords.col,
            cell: newTailCell,
        });
        const currentTail = snake.tail;
        snake.tail = newTail;
        snake.tail.next = currentTail;

        newSnakeCells.add(newTailCell);
        setSnakeCells(newSnakeCells);
    }

    const handleFoodConsumption = () => {
        const maxPossibleCellValue = BOARD_SIZE * BOARD_SIZE;
        let nextFoodCell;
       
        while (true){
            nextFoodCell = randomIntFromInterval(1, maxPossibleCellValue);
            if (snakeCells.has(nextFoodCell) || foodCell === nextFoodCell) continue;
            break;
        }

        setFoodCell(nextFoodCell);
        setScore(score +1);
    }

    return (
        <>
        <h1>Score: {score}</h1>
        <div className='board'>
            {board.map((row, rowIdx) => (
                <div key={rowIdx} className='row'>{
                    row.map((cellValue, cellIdx) => (
                        <div 
                        key={cellIdx} 
                        className={`cell ${
                        snakeCells.has(cellValue) ? 'snake-cell' : ''
                        }${foodCell === cellValue ? 'food-cell' : ''}`}></div>
                    ))
                }</div>
            ))}
        </div>
        </>
    );
};

const createBoard = BOARD_SIZE => {
    let counter =1;
    const board =[];
    for(let row =0; row < BOARD_SIZE; row++){
        const currentRow =[];
        for(let col =0; col < BOARD_SIZE; col++){
            currentRow.push(counter++);
        }
        board.push(currentRow);
    }
    return board;
}

const getCoordsInDirection = (coords, direction) => {
    if (direction === Direction.UP) {
      return {
        row: coords.row - 1,
        col: coords.col,
      };
    }
    if (direction === Direction.RIGHT) {
      return {
        row: coords.row,
        col: coords.col + 1,
      };
    }
    if (direction === Direction.DOWN) {
      return {
        row: coords.row + 1,
        col: coords.col,
      };
    }
    if (direction === Direction.LEFT) {
      return {
        row: coords.row,
        col: coords.col - 1,
      };
    }
  }

const isOutOfBounds = (coords, board) => {
    const {row, col} = coords;
    if (row < 0 || col < 0) return true;
    if (row >= board.length || col >= board[0].length) return true;
    return false;

}

const getDirectionFromKey = key =>{
    if (key === 'ArrowUp') return Direction.UP;
    if (key === 'ArrowRight') return Direction.RIGHT;
    if (key === 'ArrowDown') return Direction.DOWN;
    if (key === 'ArrowLeft') return Direction.LEFT;
    return '';
}

const getNextNodeDirection = (node, currentDirection) => {
    
    if (node.next === null ) return currentDirection;
    const {row: currentRow, col: currentCol} = node.value;
    const {row: nextRow, col: nextCol} = node.next.value; 

    if (nextRow === currentRow && nextCol === currentCol +1){
        return Direction.RIGHT;
    }
    if (nextRow === currentRow && nextCol === currentCol -1){
        return Direction.LEFT;
    }
    if (nextCol === currentCol && nextRow === currentRow +1){
        return Direction.DOWN;
    }
    if (nextCol === currentCol && nextRow === currentRow -1){
        return Direction.UP;
    }

    return '';
}

const getGrowthNodeCoords = (snakeTail, currentDirection) => {
    const tailNextNodeDirection = getNextNodeDirection(snakeTail, currentDirection);
    const growthDirection = getOppositeDirection(tailNextNodeDirection);
    const currentTailCoords ={
        row: snakeTail.value.row,
        col: snakeTail.value.col,
    };
    const growthNodeCoords = getCoordsInDirection(
        currentTailCoords,
        growthDirection,
    );
    
    return growthNodeCoords;
}

const getOppositeDirection = direction => {
    if (direction === Direction.UP) return Direction.DOWN;
    if (direction === Direction.RIGHT) return Direction.LEFT;
    if (direction === Direction.DOWN) return Direction.UP;
    if (direction === Direction.LEFT) return Direction.RIGHT;
}

export default Board;