const { useEffect, useState, Fragment } = React;

const difficultyList = [
    {
        fieldWidth: 550,
        cellSize: 50,
        cellCount: 11,
        mineCount: 12,
    },

    {
        fieldWidth: 600,
        cellSize: 40,
        cellCount: 15,
        mineCount: 34,
    },

    {
        fieldWidth: 665,
        cellSize: 35,
        cellCount: 19,
        mineCount: 72,
    }
]

function getRandomInt(num) {
    return Math.floor(Math.random() * num);
}

function createMatrix(difficulty) {
    const matrix = []

    for (let i = 0; i < difficulty.cellCount; i++) {
        const rowMatrix = []
        for (let j = 0; j < difficulty.cellCount; j++) {
            rowMatrix.push(0)
        }

        matrix.push(rowMatrix)
    }

    for (let i = 0; i < difficulty.mineCount;) {
        const x = getRandomInt(difficulty.cellCount)
        const y = getRandomInt(difficulty.cellCount)

        if (matrix[y][x] == 9) { continue }
        matrix[y][x] = 9
        i++

        for (let el_y = -1; el_y <= 1; el_y++) {
            for (let el_x = -1; el_x <= 1; el_x++) {
                if (el_y === 0 && el_x == 0) { continue }
                plusValue(y + el_y, x + el_x)
            }
        }


    }

    function plusValue(y, x) {
        if (matrix[y] === undefined) { return }
        if (matrix[y][x] === 9) { return }
        matrix[y][x]++
    }

    return matrix
}

function elInList(el, list) {
    for (let i = 0; i < list.length; i++) {
        if (el === list[i]) { return true }
    }

    return false
}

// REACT КОМПОНЕНТЫ

function Cell(props) {
    const [stateFlag, setStateFlag] = useState(false)

    let value = props.fieldGame[props.i][props.j]
    const idCell = `${props.i}.${props.j}`

    if (props.listCell.length === 0 && stateFlag) {
        setStateFlag(false)
    }

    if (value === 9) { value = '💣' }
    else if (value === 0) { value = '' }

    function pushCell(y, x, listOpenCell) {
        if (props.fieldGame[y][x] !== 0) { return listOpenCell }
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const checkId = `${y + i}.${x + j}`
                if (elInList(checkId, props.listCell)) { continue }
                if (elInList(checkId, listOpenCell)) { continue }
                if (props.diff.cellCount <= y + i || y + i < 0 || props.diff.cellCount <= x + j || x + j < 0) { continue }
                listOpenCell.push(checkId)
                listOpenCell = pushCell(y + i, x + j, listOpenCell)
            }
        }
        return listOpenCell
    }

    function OpenMine() {
        let listOpenCell = []
        for (let i = 0; i < props.diff.cellCount; i++) {
            for (let j = 0; j < props.diff.cellCount; j++) {
                if (props.fieldGame[i][j] === 9) {
                    listOpenCell.push(`${i}.${j}`)

                }
            }
        }
        return listOpenCell
    }


    const cellOnClick = () => {
        if (stateFlag) { return }
        if (props.open) { return }
        if (props.gameOver) { return }
        if (props.win) { return }

        if (value === '💣') {
            let listOpenCell = OpenMine()
            props.setListCell([...props.listCell, ...listOpenCell])
            props.setGameover(true)
        } else if (value === '') {
            let listOpenCell = []
            listOpenCell.push(idCell)
            listOpenCell = pushCell(props.i, props.j, listOpenCell)
            props.setListCell([...props.listCell, ...listOpenCell])
        } else { props.setListCell([...props.listCell, idCell]) }
    }

    const cellOnContextMenu = (event) => {
        event.preventDefault()
        if (props.gameOver) { return }
        if (props.win) { return }
        setStateFlag(!stateFlag)
    }

    const style = [
        `cell_size_${props.diff.cellSize}`,
        props.open ? `open_color_${(props.i + props.j) % 2}` : `closed_color_${(props.i + props.j) % 2}`,
        `color_num_${value === '💣' || value === '' ? 1 : value}`
    ]

    return (
        <div
            onClick={cellOnClick}
            className={style.join(' ')}
            onContextMenu={cellOnContextMenu}
        >
            {props.open && value}
            {(stateFlag && !props.open) && '🚩'}
        </div>
    )
}

function Field(props) {
    const fieldMatrix = []
    for (let i = 0; i < props.difficulty.cellCount; i++) {
        for (let j = 0; j < props.difficulty.cellCount; j++) {
            const id = `${i}.${j}`
            fieldMatrix.push(
                <Cell
                    key={id}
                    i={i}
                    j={j}
                    open={elInList(id, props.listCell) ? true : false}
                    listCell={props.listCell}
                    setListCell={props.setListCell}
                    diff={props.difficulty}
                    fieldGame={props.fieldGame}
                    setGameover={props.setGameover}
                    gameOver={props.gameOver}
                    win={props.win}
                />
            )
        }
    }

    return (
        <Fragment>
            {fieldMatrix}
        </Fragment>
    )
}

function Difficulty(props) {
    const diffOnChange = (event) => {
        props.setDifficulty(difficultyList[event.target.value])
        props.setFieldGame(createMatrix(difficultyList[event.target.value]))
        props.setListCell([])
        props.setGameover(false)
        props.setWin(false)
        props.setCheckTimer(false)
        props.setTimer(0)
    }

    return (
        <div className="difficulty_game">
            <input
                type="range"
                id="difficulty"
                min="0"
                max="2"
                defaultValue="0"
                className="range_difficulty"
                onChange={diffOnChange}
            />
            <label className="range_difficulty_name" htmlFor="difficulty">Сложность</label>
        </div>
    )
}

function Timer(props) {
    useEffect(() => {
        if (props.checkTimer) {
            setTimeout(getTime, 1000)
        }

    }, [props.checkTimer, props.timer]);

    const getTime = () => {
        props.setTimer((value) => value + 1)

    }

    const minutes = Math.floor(props.timer / 60)
    const seconds = props.timer % 60

    return (
        <h1 className="timer" id="timer">
            {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
        </h1>
    )
}

function NewGame(props) {
    return (
        <input
            onClick={() => {
                props.setFieldGame(createMatrix(props.difficulty))
                props.setListCell([])
                props.setGameover(false)
                props.setWin(false)
                props.setCheckTimer(false)
                props.setTimer(0)
            }}
            type="button"
            id="new_game"
            value="Новая игра"
            className="button_new_game"
        />
    )
}

function App() {
    const [difficulty, setDifficulty] = useState(difficultyList[0])
    const [fieldGame, setFieldGame] = useState(createMatrix(difficulty))
    const [listCell, setListCell] = useState([])
    const [win, setWin] = useState(false)
    const [gameOver, setGameover] = useState(false)
    const [checkTimer, setCheckTimer] = useState(false)
    const [timer, setTimer] = useState(0)

    if (listCell.length === (difficulty.cellCount ** 2 - difficulty.mineCount) && !win) {
        setWin(true)
    }

    if (!checkTimer && listCell.length > 0 && !gameOver && !win) {
        setCheckTimer(true)
    }

    if (checkTimer && (gameOver || win)) {
        setCheckTimer(false)
    }

    return (
        <Fragment>
            <div className="info_game">
                <Difficulty
                    setDifficulty={setDifficulty}
                    setFieldGame={setFieldGame}
                    setListCell={setListCell}
                    setWin={setWin}
                    setGameover={setGameover}
                    setCheckTimer={setCheckTimer}
                    setTimer={setTimer}
                />
                <Timer
                    checkTimer={checkTimer}
                    timer={timer}
                    setTimer={setTimer}
                />
                <NewGame
                    setFieldGame={setFieldGame}
                    difficulty={difficulty}
                    setListCell={setListCell}
                    setWin={setWin}
                    setGameover={setGameover}
                    setCheckTimer={setCheckTimer}
                    setTimer={setTimer}
                />
            </div>
            <div className={`field_game field_widgth_${difficulty.fieldWidth}`} id="field_game">
                <Field
                    difficulty={difficulty}
                    fieldGame={fieldGame}
                    listCell={listCell}
                    setListCell={setListCell}
                    setGameover={setGameover}
                    gameOver={gameOver}
                    win={win}
                />
            </div>
            <div className="win_or_lose" id="win_or_lose">
                {gameOver ? <span style={{ color: 'red' }}>Не повезло!</span> : ''}
                {win ? <span style={{ color: 'green' }}>Победа!</span> : ''}
            </div>
        </Fragment>
    )
}

const domContainer = document.querySelector('#main_container');
const root = ReactDOM.createRoot(domContainer);
root.render(<App />);