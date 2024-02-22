要构建消消乐主要分几步：
 1.消消乐是一般是由几种方块模型，构成的游戏界面
 2.竖向或者横向紧挨着相同的花色，大于等于3的就消除
 3，消除后方块，接替上一层级的方块，最顶部的row生成新的方块
 4 实现drag，方块拖动方向为上下左右，要考虑边界（顶部row，底部row）

实现要点：
1.使用Array接受数据，tailwind css来实现8x8的样式
const boardData = Array(boardSize*boardSize).fill(None).map(()
   =>Math.floor(Math.random()* candies.length))
2.实现消除算法
消除算法按照方向分为column和row。以8*8为例，如果是column判断条件(连续3个或4个是同一img):
```
//迭代[0,63]的i
 const columnOfFour =[i,i+boardSize,i+boardSize * 2,i+boardSize * 3]
  const columnOfThree =[i,i+boardSize,i+boardSize * 2]
```
其中column方向消除4个i的区间为[0,39],因为在8*8的界面中，39以后（index=39刚好是第4排）就不可能达成4个相同花色。
如果column方向消除3个的话，i区间则为[0,47]。
row方向和column方向一样，都需要迭代：
```
const rowOfFour =[i,i+1,i+2,i+ 3]
const rowOfThree =[i,i+1，i+2]
```
同样row方向消除4个和消除3个也有限制，因为

3.生成新方块算法
无论是横向消除还是竖向消除，都是空白层继承上层方块，直到最上层为空然后随机生成新方块。
4.drag
首先给Tile加上，drag和drop支持。然后实现合法的上下左右的合理动作。
1.首先得上下左右，然后如果是最顶，最低，最左和最右。都要考虑边界条件。
2.拖动成功必须是在横向或者竖向能达成消除算法条件。

这个游戏用了Redux，为什么需要Redux？
首先游戏组件先分成Board组件和构建Board的Tile组件。
初始化创建：
初始化首先创建Board面板，利用redux创建了updateBoard 函数，这个函数无论是初始化，还是游戏后的状态变化都会调用该函数。
```
//store

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
    }
})

export const store = configureStore({
    reducer:{
        candyCrush: candyCrushSlice.reducer
    },
   
})

   
组件代码：
function App() {
  const dispatch = useAppDispatch()
  const board = useAppSelector(({candyCrush: {board} })=>board)
  const boardSize = useAppSelector(({candyCrush: {boardSize} })=>boardSize)
  
    useEffect(()=>{
      dispatch(updateBoard(createBoard(boardSize)))
    },[dispatch,boardSize])
 }
    
     return (
    <div className="flex items-center justify-center h-screen">
    <Board />
  </div>
  )
   }
    
   function Board () {
    const board: string[] = useAppSelector(({ candyCrush: { board } }) => board);
    const boardSize: number = useAppSelector(
      ({ candyCrush: { boardSize } }) => boardSize
    );
    return(
        <div className="flex flex-wrap rounded-lg"
            style={{width:`${6.25 * boardSize}rem`}}>
            {board.map((candy:string,index:number)=>(
                <Tile candy={candy} candyId={index} key={index}></Tile>
            ))}
        </div>
    )
}

function Tile({ candy, candyId }: { candy: string; candyId: number }) {
  const dispatch = useAppDispatch();

  return (
    <div
      className="h-24 w-24 flex justify-center items-center m-0.5 rounded-lg select-none"
      style={{
        boxShadow: "inset 5px 5px 15px #062525,inset -5px -5px 15px #aaaab7bb",
      }}
    >
      {candy && (
        <img
          src={candy} />)}
    </div>
```    
游戏面板初始化创建在App.tsx 文件中，Board.tsx 通过useAppSelector 获取初始化数据，然后渲染生成Board组件。
消除和生成：
创建完成的时候，游戏需要先把符合条件（连续3个或4个相同img）消除，然后Board的state更新，生成新Board的图像。然后生成新的方块填补。
在App.tsx 中增加如下代码：
```
 useEffect(() => {
      const timeout = setTimeout(() => {
        const newBoard = [...board];
        //消除方块
        checkForRowOfFour(
          newBoard,
          boardSize,
          generateInvalidMoves(boardSize, true)
        );
        ...
        ...
        //更新消除方块的Board的sstate
        dispatch(updateBoard(newBoard));
        //生成新方块
        dispatch(moveBelow())
      }, 150);
      return () => clearInterval(timeout);
    }, [board, dispatch, boardSize]);
```
使用timeout定时执行消除操作和生成操作。
moveBelow的实现逻辑也很简单，首先判断第一行有没有消除的，有空白的就生成新方块。如果下一层也有空白，那么 newBoard[i + boardSize] = newBoard[i]，直接拿下上一层的数据。这个
还有一点要注意的是：for-loop的i区间为[0,boardSize*boardSize-boardsize-1]到倒数第二层为止，这个也很好理解，最后一层只要接住上面滑下来的方块。
```
const moveBelowReducer = (
    state: Draft<{
      board: string[];
      boardSize: number;
      squareBeingReplaced: Element | undefined;
      squareBeingDragged: Element | undefined;
    }>
  ) => {
    const newBoard: string[] = [...state.board];
    const { boardSize } = state;
    let boardChanges: boolean = false;
    const formulaForMove: number = formulaForMoveBelow(boardSize);
    for (let i = 0; i <= boardSize*boardSize-boardsize-1; i++) {
      const firstRow = Array(boardSize)
        .fill(0)
        .map((_value: number, index: number) => index);
  
      const isFirstRow = firstRow.includes(i);
  
      if (isFirstRow && newBoard[i] === "") {
        let randomNumber = Math.floor(Math.random() * candies.length);
        newBoard[i] = candies[randomNumber];
        boardChanges = true;
      }
  
      if (newBoard[i + boardSize] === "") {
        newBoard[i + boardSize] = newBoard[i];
        newBoard[i] = "";
        boardChanges = true;
      }
      if (boardChanges) state.board = newBoard;
    }
  };
  ```
添加drag操作：
需要给Tile组件增加drag功能并确定两个交换方块的index。
在store中增加关于drag的函数。
```
//store
 reducers:{
        updateBoard:(state,action: PayloadAction<string[]>) =>{
            state.board = action.payload
        },
        dragStart: (state, action: PayloadAction<any>) => {
            state.squareBeingDragged = action.payload;
          },
          dragDrop: (state, action: PayloadAction<any>) => {
            state.squareBeingReplaced = action.payload;
          },
          dragEnd: dragEndReducer,
        moveBelow:moveBelowReducer
    }
    //Tile
    function Tile({ candy, candyId }: { candy: string; candyId: number }) {
  const dispatch = useAppDispatch();

  return (
    <div
      className="h-24 w-24 flex justify-center items-center m-0.5 rounded-lg select-none"
      style={{
        boxShadow: "inset 5px 5px 15px #062525,inset -5px -5px 15px #aaaab7bb",
      }}
    >
      {candy && (
        <img
          src={candy}
          alt=""
          className="h-20 w-20"
          draggable={true}
          onDragStart={(e) => dispatch(dragStart(e.target))}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
          onDragLeave={(e) => e.preventDefault()}
          onDrop={(e) => dispatch(dragDrop(e.target))}
          onDragEnd={() => dispatch(dragEnd())}
          candy-id={candyId}
        />
      )}
    </div>
  );
}
```
dragStart 获得squareBeingDragged 元素，drop 事件则获得squareBeingReplaced 元素，两个元素交换主要依赖于dragEnd 函数。
dragEnd的实现条件必须满足首先交换后的位置只能是交换前上下左右4个position,并且交换后能触发消除。
伪代码：
```
const dragEndReducer = (
  state: Draft<{
    board: string[];
    boardSize: number;
    squareBeingReplaced: Element | undefined;
    squareBeingDragged: Element | undefined;
  }>
) => {
  const newBoard = [...state.board];
  let { boardSize, squareBeingDragged, squareBeingReplaced } = state;
  const squareBeingDraggedId: number = parseInt(
    squareBeingDragged?.getAttribute("candy-id") as string
  );
  const squareBeingReplacedId: number = parseInt(
    squareBeingReplaced?.getAttribute("candy-id") as string
  );
  //交换方块图片
  newBoard[squareBeingReplacedId] = squareBeingDragged?.getAttribute(
    "src"
  ) as string;
  newBoard[squareBeingDraggedId] = squareBeingReplaced?.getAttribute(
    "src"
  ) as string;

  const validMoves: number[] = [
    squareBeingDraggedId - 1,
    squareBeingDraggedId - boardSize,
    squareBeingDraggedId + 1,
    squareBeingDraggedId + boardSize,
  ];

  const validMove: boolean = validMoves.includes(squareBeingReplacedId);


  if (
    squareBeingReplacedId &&
    validMove &&
    clear
  ) {
    squareBeingDragged = undefined;
    squareBeingReplaced = undefined;
  } else {
  //不符合条件，则还原自己的图片
    newBoard[squareBeingReplacedId] = squareBeingReplaced?.getAttribute(
      "src"
    ) as string;
    newBoard[squareBeingDraggedId] = squareBeingDragged?.getAttribute(
      "src"
    ) as string;
  }
  state.board = newBoard;
};
```
