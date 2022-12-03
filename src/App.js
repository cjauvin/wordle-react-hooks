import "./App.css";
import { useCallback, useEffect, useState } from "react";

function testGuess(guess, word) {
  //console.log(guess, word);
  let statuses = [];
  for (let i = 0; i < 5; i++) {
    if (guess[i].letter === word[i]) {
      statuses.push("yes");
    } else if (word.includes(guess[i].letter)) {
      statuses.push("present");
    } else {
      statuses.push("no");
    }
  }
  return statuses;
}

function App() {
  const [word, setWord] = useState(null);
  const [rows, setRows] = useState(
    [...Array(6)].map((e) => Array(5).fill(null))
  );
  const [currRowIndex, setCurrRowIndex] = useState(0);
  const [currCellIndex, setCurrCellIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [reset, setReset] = useState(true);

  const handleKeyDown = useCallback(
    (e) => {
      if (done) {
        return;
      }

      console.log(currRowIndex);

      // Submit guess
      if (e.key === "Enter") {
        if (currCellIndex < 5) {
          return;
        }
        let statuses = testGuess(rows[currRowIndex], word.toUpperCase());
        setRows(
          rows.map((row, rowIndex) =>
            row.map((cell, cellIndex) =>
              rowIndex === currRowIndex
                ? {
                    letter: rows[rowIndex][cellIndex].letter,
                    status: statuses[cellIndex],
                  }
                : cell
            )
          )
        );

        if (statuses.every((v) => v === "yes")) {
          setDone(true);
          console.log("you won!");
        } else if (currRowIndex < 5) {
          setCurrRowIndex(currRowIndex + 1);
          setCurrCellIndex(0);
        } else {
          console.log("you lost..");
        }

        // Backspace
      } else if (e.key === "Backspace") {
        if (currCellIndex === 0) {
          return;
        }

        setRows(
          rows.map((row, rowIndex) =>
            row.map((cell, cellIndex) =>
              rowIndex === currRowIndex && cellIndex === currCellIndex - 1
                ? null
                : cell
            )
          )
        );
        setCurrCellIndex(currCellIndex - 1);

        // Enter letter
      } else {
        if (currCellIndex > 4 || e.key < "a" || e.key > "z") {
          return;
        }

        setRows(
          rows.map((row, rowIndex) =>
            row.map((cell, cellIndex) =>
              rowIndex === currRowIndex && cellIndex === currCellIndex
                ? { letter: e.key.toUpperCase(), status: "" }
                : cell
            )
          )
        );
        setCurrCellIndex(currCellIndex + 1);
      }
    },
    [rows, currRowIndex, currCellIndex, done, word]
  );

  const handleRestartButton = (e) => {
    e.target.blur();
    setRows([...Array(6)].map((e) => Array(5).fill(null)));
    setCurrRowIndex(0);
    setCurrCellIndex(0);
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

  return (
    <div className="App">
      <div className="board">
        {rows.map((row, rowIndex) => (
          <Row key={rowIndex}>
            {row.map((cell, cellIndex) =>
              cell ? (
                <Cell key={cellIndex} status={cell.status}>
                  {cell.letter}
                </Cell>
              ) : (
                <Cell key={cellIndex}></Cell>
              )
            )}
          </Row>
        ))}
      </div>
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
