import { useEffect, useState } from "react";

const StatusBar = ({
  type,
  lines,
  words,
  chars,
  vocab,
  synonyms,
  read,
  autocomplete,
  replaceCurrentWord,
}: Props) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const keyHandler = (e: {
      key: string;
      keyCode: number;
      preventDefault(): unknown;
      shiftKey: boolean;
    }) => {
      if (type === "autocomplete" && e.key === "Tab") {
        e.preventDefault();
        replaceCurrentWord(autocomplete);
        setCurrent(0);
      } else if (e.key === "Tab") {
        if (e.shiftKey) {
          setCurrent(current + 1 < synonyms.length ? current + 1 : 0);
        } else {
          replaceCurrentWord(synonyms[current] || "");
          setCurrent(0);
        }
        e.preventDefault();
        return;
      }
    };

    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  });

  const readChars = (read: number) => {
    let string = "";
    for (let i = 1; i <= read; i++) {
      string += "|";
    }
    return string;
  };

  return (
    <div className="fixed bottom-0 flex h-8 w-full flex-row gap-4 text-sm">
      {type === "synonyms" ? (
        synonyms.map((word, ind) => (
          <div
            className={`text-neutral ${current === ind ? "underline" : ""}`}
            key={ind}
          >
            {word}
          </div>
        ))
      ) : type === "%" ? (
        <div className="flex flex-row gap-2 text-neutral">
          <div className="flex">
            <div className="text-accent">
              {readChars(Math.round((read / 100) * 10))}
            </div>
            <div>{readChars(10 - Math.round((read / 100) * 10))}</div>
          </div>{" "}
          <div>{read}%</div>
        </div>
      ) : type === "stats" ? (
        <div className="text-neutral">
          {lines}L {words}W {vocab}V {chars}C {read}%
        </div>
      ) : type === "autocomplete" ? (
        <div className={`text-neutral underline`}>{autocomplete}</div>
      ) : type === "insert" ? (
        <div className="flex flex-row gap-2">
          <div>Insert Mode</div>
          <div className="text-neutral">c-d</div>
          <div className="text-neutral underline">Date</div>
          <div className="text-neutral">c-u</div>
          <div className="text-neutral underline">Time</div>
          <div className="text-neutral">c-p</div>
          <div className="text-neutral underline">Path</div>
          <div className="text-neutral">c-h/H</div>
          <div className="text-neutral underline">Header</div>
          <div className="text-neutral">c-/</div>
          <div className="text-neutral underline">Comment</div>
          <div className="text-neutral">Esc</div>
          <div className="text-neutral underline">Exit</div>
        </div>
      ) : null}
    </div>
  );
};

interface Props {
  type: "synonyms" | "%" | "stats" | "autocomplete" | "insert";
  lines: number;
  words: number;
  chars: number;
  vocab: number;
  synonyms: string[];
  read: number;
  autocomplete: string;
  replaceCurrentWord: (newWord: string) => void;
}

export default StatusBar;
