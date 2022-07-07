import "./App.css";
import { useCallback, useEffect, useState } from "react";

function testGuess(guess, word) {
  //console.log(guess, word);
  let statuses = [];
  for (let i = 0; i < 5; i++) {
    if (guess[i][0] === word[i]) {
      statuses.push("yes");
    } else if (word.includes(guess[i][0])) {
      statuses.push("present");
    } else {
      statuses.push("no");
    }
  }
  return statuses;
}

function App() {
  const [word, setWord] = useState(null);
  const [grid, setGrid] = useState(
    [...Array(6)].map((e) => Array(5).fill(["", ""]))
  );
  const [coords, setCoords] = useState([0, 0]);
  const [done, setDone] = useState(false);
  const [reset, setReset] = useState(true);

  const handleKeyDown = useCallback(
    (e) => {
      let targetCoords = [];
      let newCoords = [];
      let letterToPrint = "";
      if (done) {
        return;
      }

      // Submit guess
      if (e.key === "Enter") {
        if (coords[1] !== 5) {
          return;
        }
        let statuses = testGuess(grid[coords[0]], word.toUpperCase());
        //console.log(statuses);
        setGrid((prevGrid) =>
          prevGrid.map((row, i) =>
            row.map((cell, j) =>
              i === coords[0]
                ? [prevGrid[i][j][0], statuses[j]]
                : prevGrid[i][j]
            )
          )
        );
        if (statuses.every((v) => v === "yes")) {
          setDone(true);
          console.log("you won");
        } else if (coords[0] < 5) {
          setCoords([coords[0] + 1, 0]);
        } else {
          console.log("you lost");
        }
        return;
        // Backspace
      } else if (e.key === "Backspace") {
        if (coords[1] === 0) {
          return;
        }
        targetCoords = [coords[0], coords[1] - 1];
        newCoords = targetCoords;
        letterToPrint = "";
        // Enter letter
      } else {
        if (coords[1] > 4 || e.key < "a" || e.key > "z") {
          return;
        }
        targetCoords = [coords[0], coords[1]];
        newCoords = [coords[0], coords[1] + 1];
        letterToPrint = e.key.toUpperCase();
      }
      setGrid((prevGrid) =>
        prevGrid.map((row, i) =>
          row.map((cell, j) =>
            i === targetCoords[0] && j === targetCoords[1]
              ? [letterToPrint, ""]
              : prevGrid[i][j]
          )
        )
      );
      setCoords([newCoords[0], newCoords[1]]);
    },
    [grid, coords, done, word]
  );

  const handleRestartButton = (e) => {
    e.target.blur();
    setGrid([...Array(6)].map((e) => Array(5).fill(["", ""])));
    setCoords([0, 0]);
    setDone(false);
    setReset(true);
  };

  useEffect(() => {
    if (!reset) {
      return;
    }
    fetch("https://raw.githubusercontent.com/tabatkins/wordle-list/main/words")
      .then((r) => r.text())
      .then((text) => {
        const words = text.split(/\r?\n/);
        const word = words[Math.floor(Math.random() * words.length)];
        setWord(word);
        console.log(word);
        setReset(false);
      });
  }, [reset]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  let rows = [];
  for (let i = 0; i < 6; i++) {
    let cells = [];
    for (let j = 0; j < 5; j++) {
      const letter = grid[i][j][0];
      const status = grid[i][j][1];
      cells.push(
        <Cell key={j} status={status}>
          {letter}
        </Cell>
      );
    }
    rows.push(<Row key={i}>{cells}</Row>);
  }

  return (
    <div className="App">
      <div className="board">{rows}</div>
      <button onClick={handleRestartButton}>Restart</button>
    </div>
  );
}

function Cell(props) {
  const status = props.status ?? "";
  return <div className={"cell " + status}>{props.children}</div>;
}

function Row(props) {
  return <div className="row">{props.children}</div>;
}

export default App;
