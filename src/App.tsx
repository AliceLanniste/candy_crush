
import { useEffect } from 'react'
import './App.css'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { createBoard } from './utils/createBoard'
import Board from './components/Board'
import { moveBelow, updateBoard } from './store'
import { checkForColumnOfThree, checkForRowOfFour, checkForRowOfThree, isColumnOfFour } from './utils/moveLogic'
import { formulaForColumnOfFour, formulaForColumnOfThree, generateInvalidMoves } from './utils/formulas'

function App() {
  const dispatch = useAppDispatch()
  const board = useAppSelector(({candyCrush: {board} })=>board)
  const boardSize = useAppSelector(({candyCrush: {boardSize} })=>boardSize)
  
    useEffect(()=>{
      dispatch(updateBoard(createBoard(boardSize)))
    },[dispatch,boardSize])

    useEffect(() => {
      const timeout = setTimeout(() => {
        const newBoard = [...board];
        isColumnOfFour(newBoard, boardSize, formulaForColumnOfFour(boardSize));
        checkForRowOfFour(
          newBoard,
          boardSize,
          generateInvalidMoves(boardSize, true)
        );
        checkForColumnOfThree(
          newBoard,
          boardSize,
          formulaForColumnOfThree(boardSize)
        );
        checkForRowOfThree(newBoard, boardSize, generateInvalidMoves(boardSize));
        dispatch(updateBoard(newBoard));
        dispatch(moveBelow())
      }, 150);
      return () => clearInterval(timeout);
    }, [board, dispatch, boardSize]);
  
  return (
    <div className="flex items-center justify-center h-screen">
    <Board />
  </div>
  )
}

export default App


