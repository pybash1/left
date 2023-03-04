import { type NextPage } from "next";
import { useEffect, useState, useRef } from "react";
import Sidebar from "~/components/Sidebar";
import StatusBar from "~/components/StatusBar";
import { SYN_DB } from "~/utils/synonyms";

const Home: NextPage = () => {
  const [type, setType] = useState<"%" | "stats" | "synonyms" | "autocomplete">(
    "synonyms"
  );
  const [prose, setProse] = useState("");
  const [line, setLine] = useState(0);
  const [read, setRead] = useState(0.0);
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [headings, setHeadings] = useState<{ heading: string; line: number }[]>(
    []
  );

  const writer = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const scrollHandler = () => {
      setType("%");
    };
    const cur = writer.current;
    writer.current?.addEventListener("scroll", scrollHandler);
    return () => cur?.removeEventListener("scroll", scrollHandler);
  });

  useEffect(() => {
    const handler = () => {
      const pos = writer.current?.selectionStart;

      let wordStart = pos || 0;
      while (wordStart > 0 && /\S/.test(prose.charAt(wordStart - 1)))
        wordStart--;

      let wordEnd = pos || 0;
      while (wordEnd < prose.length && /\S/.test(prose.charAt(wordEnd)))
        wordEnd++;

      if (Object.keys(SYN_DB).includes(prose.substring(wordStart, wordEnd))) {
        setType("synonyms");
        setSynonyms(SYN_DB[prose.substring(wordStart, wordEnd)] || []);
      } else {
        setType("stats");
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

  useEffect(() => {
    const lines = prose.split("\n");
    const headings_: { heading: string; line: number }[] = [];
    lines.forEach((line, ind) => {
      if (line.startsWith("# ") || line.startsWith("## ")) {
        headings_.push({ heading: line, line: ind });
      }
    });
    setHeadings(headings_);
  }, [prose]);

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
          read={parseFloat(read.toFixed(2))}
          synonyms={synonyms}
        />
      </div>
    </div>
  );
};

export default Home;
