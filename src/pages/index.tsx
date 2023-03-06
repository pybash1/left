import { type NextPage } from "next";
import { useEffect, useState, useRef } from "react";
import Sidebar from "~/components/Sidebar";
import StatusBar from "~/components/StatusBar";
import { SYN_DB } from "~/utils/synonyms";

const Home: NextPage = () => {
  const [type, setType] = useState<
    "%" | "stats" | "synonyms" | "autocomplete" | "insert"
  >("stats");
  const [prose, setProse] = useState("");
  const [autocompleteWord, setAutocompleteWord] = useState("");
  const [line, setLine] = useState(0);
  const [read, setRead] = useState(0.0);
  const [prev, setPrev] = useState<
    "%" | "stats" | "synonyms" | "autocomplete" | "insert"
  >("stats");
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [headings, setHeadings] = useState<{ heading: string; line: number }[]>(
    []
  );

  const writer = useRef<HTMLTextAreaElement>(null);

  const wordReplacer = (newWord: string) => {
    const pos = writer.current?.selectionStart;

    let wordStart = pos || 0;
    while (wordStart > 0 && /\S/.test(prose.charAt(wordStart - 1))) wordStart--;

    let wordEnd = pos || 0;
    while (wordEnd < prose.length && /\S/.test(prose.charAt(wordEnd)))
      wordEnd++;

    const before = writer.current?.value.substring(0, wordStart);
    const after = writer.current?.value.substring(wordEnd);
    setProse((before as string) + newWord + (after as string));
  };

  const insertDate = () => {
    const d = new Date();
    const strArr = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const d_ = d.getDate();
    const m = strArr[d.getMonth()];
    const y = d.getFullYear();
    return `${d_ <= 9 ? `0${d_}` : d_}-${m as string}-${y}`;
  };

  const insertTime = () => {
    return new Date().toLocaleTimeString();
  };

  // scroll hand;er
  useEffect(() => {
    const scrollHandler = () => {
      if (type !== "insert") setType("%");
    };
    const cur = writer.current;
    writer.current?.addEventListener("scroll", scrollHandler);
    return () => cur?.removeEventListener("scroll", scrollHandler);
  });

  // synonyms, autocomplete, and stats handler
  useEffect(() => {
    const handler = () => {
      const pos = writer.current?.selectionStart;

      let wordStart = pos || 0;
      while (wordStart > 0 && /\S/.test(prose.charAt(wordStart - 1)))
        wordStart--;

      let wordEnd = pos || 0;
      while (wordEnd < prose.length && /\S/.test(prose.charAt(wordEnd)))
        wordEnd++;

      if (
        Object.keys(SYN_DB).includes(
          prose.substring(wordStart, wordEnd).toLowerCase()
        ) &&
        type !== "insert"
      ) {
        setType("synonyms");
        setSynonyms(
          SYN_DB[prose.substring(wordStart, wordEnd).toLowerCase()] || []
        );
      } else {
        const words = Object.keys(SYN_DB);
        const moreWords = Object.values(SYN_DB);
        moreWords.forEach((word) => {
          words.concat(word);
        });
        const autocomplete = words.find(
          (word) =>
            !(prose.substring(wordStart, wordEnd).toLowerCase() === "") &&
            word.startsWith(prose.substring(wordStart, wordEnd).toLowerCase())
        );
        if (autocomplete && type !== "insert") {
          setAutocompleteWord(autocomplete);
          setType("autocomplete");
        } else {
          if (type !== "insert") setType("stats");
        }
      }

      const text = writer.current?.value.slice(0, pos);
      setLine((text?.match(/\n/g) || []).length);

      setRead((prose.substring(0, pos).length / prose.length) * 100);
    };

    const cur = writer.current;
    writer.current?.addEventListener("mouseup", handler);
    writer.current?.addEventListener("keyup", handler);
    return () => {
      cur?.removeEventListener("mouseup", handler);
      cur?.removeEventListener("keyup", handler);
    };
  });

  // insert mode key handler
  useEffect(() => {
    const insertHandler = (e: {
      preventDefault(): unknown;
      key: string;
      ctrlKey: boolean;
      metaKey: boolean;
    }) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        e.preventDefault();
        setPrev(type);
        setType("insert");
      }
    };

    window.addEventListener("keydown", insertHandler);
    return () => window.removeEventListener("keydown", insertHandler);
  });

  // heading handler
  useEffect(() => {
    const lines = prose.split("\n");
    const headings_: { heading: string; line: number }[] = [];
    lines.forEach((line, ind) => {
      if (
        line.startsWith("# ") ||
        line.startsWith("## ") ||
        line.startsWith("-- ")
      ) {
        headings_.push({ heading: line, line: ind });
      }
    });
    setHeadings(headings_);
  }, [prose]);

  // insert mode shortcuts handler
  useEffect(() => {
    const shortcutHandler = (e: {
      key: string;
      preventDefault(): unknown;
      ctrlKey: boolean;
      metaKey: boolean;
    }) => {
      if (type === "insert") {
        if (e.key === "Escape") {
          e.preventDefault();
          setType(prev || "stats");
        } else if (e.ctrlKey || e.metaKey) {
          const pos = writer.current?.selectionStart;
          const before = prose.substring(0, pos);
          const after = prose.substring(pos as number);
          const lineStart = before.lastIndexOf("\n") + 1;
          const lineEnd = after.indexOf("\n");
          const line_ = prose.substring(lineStart, (pos as number) + lineEnd);
          if (e.key === "h") {
            e.preventDefault();
            setProse(
              `${before.substring(0, lineStart)}# ${line_}` +
                after.substring(lineEnd)
            );
          } else if (e.key === "H") {
            e.preventDefault();
            setProse(
              `${before.substring(0, lineStart)}## ${line_}` +
                after.substring(lineEnd)
            );
          } else if (e.key === "/") {
            e.preventDefault();
            setProse(
              `${before.substring(0, lineStart)}-- ${line_}` +
                after.substring(lineEnd)
            );
          } else if (e.key === "d") {
            e.preventDefault();
            setProse(`${before}${insertDate()}${after}`);
          } else if (e.key === "u") {
            e.preventDefault();
            setProse(`${before}${insertTime()}${after}`);
          } else if (e.key === "p") {
            e.preventDefault();
            setProse(`${before}<path coming soon>${after}`);
          }
          setType(prev || "stats");
        }
      }
    };

    window.addEventListener("keydown", shortcutHandler);
    return () => window.removeEventListener("keydown", shortcutHandler);
  });

  return (
    <div className="grid min-h-screen grid-cols-5 bg-base font-mono text-white">
      <div className="w-full">
        <Sidebar headings={headings} line={line} />
      </div>
      <div className="col-span-4">
        <textarea
          value={prose}
          onChange={(e) => setProse(e.target.value)}
          onClick={() => setType("stats")}
          className="h-[calc(100%-38px)] w-full resize-none bg-base py-10 px-10 text-sm outline-none"
          ref={writer}
        ></textarea>
        <StatusBar
          type={type}
          chars={prose.trim().replaceAll(" ", "").length}
          vocab={
            prose === "" ? 0 : [...new Set(prose.trim().split(" "))].length
          }
          lines={prose === "" ? 0 : prose.trim().split("\n").length}
          words={
            prose === ""
              ? 0
              : prose.trim().split("\n").join(" ").split(" ").length
          }
          read={parseFloat(read.toFixed(2)) || 0.0}
          synonyms={synonyms}
          autocomplete={autocompleteWord}
          replaceCurrentWord={wordReplacer}
        />
      </div>
    </div>
  );
};

export default Home;
