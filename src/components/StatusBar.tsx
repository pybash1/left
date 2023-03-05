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
    const stabHandler = (e: {
      key: string;
      metaKey: boolean;
      preventDefault(): unknown;
      ctrlKey: boolean;
      shiftKey: boolean;
    }) => {
      if (type === "autocomplete" && e.key === "Tab") {
        e.preventDefault();
        replaceCurrentWord(autocomplete);
      } else if (type === "synonyms" && e.key === "Tab") {
        e.preventDefault();
        replaceCurrentWord(synonyms[current] || "");
      }
      if (e.key == "Tab" && e.shiftKey) {
        e.preventDefault();
        setCurrent(current + 1 < synonyms.length ? current + 1 : 0);
      }
    };

    window.addEventListener("keydown", stabHandler);
    return () => window.removeEventListener("keydown", stabHandler);
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
      ) : null}
    </div>
  );
};

interface Props {
  type: "synonyms" | "%" | "stats" | "autocomplete";
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
