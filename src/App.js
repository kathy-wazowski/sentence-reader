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
    const sentences = [];
    const quotePairs = {
      '"': '"',
      "'": "'",
      '“': '”',
      '‘': '’',
    };
    let i = 0;
    while (i < text.length) {
      let start = i;
      // Skip leading whitespace
      while (start < text.length && /\s/.test(text[start])) {
        start++;
      }

      if (start >= text.length) break;

      const startChar = text[start];
      if (Object.keys(quotePairs).includes(startChar)) {
        const endQuoteChar = quotePairs[startChar];
        let endQuote = text.indexOf(endQuoteChar, start + 1);
        if (endQuote === -1) { // No matching quote, treat rest of text as one sentence
          sentences.push(text.substring(start).trim());
          break;
        }
        // Include the quote in the sentence
        let sentence = text.substring(start, endQuote + 1);
        sentences.push(sentence.trim());
        i = endQuote + 1;
      } else {
        let endMarks = [];
        let nextPeriod = text.indexOf('.', start);
        if (nextPeriod !== -1) endMarks.push(nextPeriod);
        let nextQuestion = text.indexOf('?', start);
        if (nextQuestion !== -1) endMarks.push(nextQuestion);
        let nextExclamation = text.indexOf('!', start);
        if (nextExclamation !== -1) endMarks.push(nextExclamation);

        if (endMarks.length === 0) { // No more sentence terminators
          sentences.push(text.substring(start).trim());
          break;
        }

        // Find the earliest sentence terminator
        let endOfSentence = Math.min(...endMarks);
        
        let sentence = text.substring(start, endOfSentence + 1);
        sentences.push(sentence.trim());
        i = endOfSentence + 1;
      }
    }
    return sentences.filter((s) => s.length > 0);
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
