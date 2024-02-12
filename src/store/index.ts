import { PayloadAction, configureStore, createSlice } from "@reduxjs/toolkit"
import { moveBelowReducer } from "./reducers/moveBelow"


const initialState :{
    board:string[],
    boardSize:number,
    squareBeingReplaced: Element | undefined;
    squareBeingDragged: Element | undefined;
} = {
    board:[],
    boardSize:8,
    squareBeingReplaced: undefined,
    squareBeingDragged:  undefined
}



const candyCrushSlice = createSlice({
    name:'candyCrush',
    initialState,
    reducers:{
        updateBoard:(state,action: PayloadAction<string[]>) =>{
            state.board = action.payload
        },
        moveBelow:moveBelowReducer
    }
})


export const store = configureStore({
    reducer:{
        candyCrush: candyCrushSlice.reducer
    }
})

export const { updateBoard,moveBelow } =
  candyCrushSlice.actions;
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch