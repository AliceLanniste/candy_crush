
import { useEffect } from 'react'
import './App.css'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { createBoard } from './utils/createBoard'
import Board from './components/Board'
import { updateBoard } from './store'

function App() {
  const dispatch = useAppDispatch()
  const board = useAppSelector(({candyCrush: {board} })=>board)
  const boardSize = useAppSelector(({candyCrush: {boardSize} })=>boardSize)
  
    useEffect(()=>{
      dispatch(updateBoard(createBoard(boardSize)))
    },[dispatch,boardSize])
  return (
    <div className="flex items-center justify-center h-screen">
    <Board />
  </div>
  )
}

export default App


