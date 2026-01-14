import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import { Input, Button } from "antd";
import "antd/dist/reset.css";

const { TextArea } = Input;

function App() {
  const [inputText, setInputText] = useState("");
  const [sentences, setSentences] = useState([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isReadingMode, setIsReadingMode] = useState(false);

  const exitReadingMode = useCallback(() => {
    setIsReadingMode(false);
    setSentences([]);
    setInputText("");
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isReadingMode) {
        if (e.key === "ArrowRight") {
          setCurrentSentenceIndex((prevIndex) =>
            Math.min(prevIndex + 1, sentences.length - 1)
          );
        } else if (e.key === "ArrowLeft") {
          setCurrentSentenceIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        } else if (e.key === "Escape") {
          exitReadingMode();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isReadingMode, sentences.length, exitReadingMode]);

  const splitSentencesCustom = (text) => {
    const result = [];
    let currentSentence = "";
    let inQuote = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      currentSentence += char;

      if (char === '"') {
        inQuote = !inQuote;
      }

      if (char === '.' && !inQuote) {
        let trimmedSentence = currentSentence.trim();
        if (trimmedSentence.length > 0) {
          if (!trimmedSentence.endsWith('.')) { // Ensure period is added back if it was part of the split
            trimmedSentence += '.';
          }
          result.push(trimmedSentence);
        }
        currentSentence = "";
      }
    }

    if (currentSentence.trim().length > 0) {
      let trimmedSentence = currentSentence.trim();
      if (!trimmedSentence.endsWith('.') && !trimmedSentence.endsWith('"')) { // Add period if it's the last sentence and doesn't end with a period or quote
        trimmedSentence += '.';
      }
      result.push(trimmedSentence);
    }
    return result;
  };

  const handleSubmit = useCallback(() => {
    const splitSentences = splitSentencesCustom(inputText)
      .filter((s) => s.length > 0);

    if (splitSentences.length > 0) {
      setSentences(splitSentences);
      setCurrentSentenceIndex(0);
      setIsReadingMode(true);
    }
  }, [inputText]);

  return (
    <div className="App">
      {!isReadingMode && <h1>Sentence Reader</h1>}
      {!isReadingMode ? (
        <>
          <TextArea
            rows={4}
            placeholder="Enter your sentence here"
            style={{ width: "80%", marginBottom: "10px" }}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <Button type="primary" onClick={handleSubmit}>
            Read
          </Button>
        </>
      ) : (
        <>
          <p
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "3em",
              minHeight: "50px",
              lineHeight: "2em",
              width: "80%",
              marginLeft: "auto",
              marginRight: "auto",
              height: "90vh",
              fontFamily: "Georgia",
            }}
          >
            <p>
              {sentences[currentSentenceIndex]}
            </p>
          </p>
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "50%",
              marginLeft: "-40px",
            }}
            className="exitBtn"
          >
            <div style={{ marginTop: "20px" }}>
              <Button onClick={exitReadingMode}>Back to Input</Button>
            </div>
            <div style={{ marginTop: "10px", color: "#888" }}>
              Use left/right arrow keys to navigate
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
