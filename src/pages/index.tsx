import { type NextPage } from "next";
import { useEffect, useState, useRef } from "react";
import Sidebar from "~/components/Sidebar";
import StatusBar from "~/components/StatusBar";
import { env } from "~/env.mjs";
import { DEFAULT_PROSE } from "~/utils/default";
import { SYN_DB } from "~/utils/synonyms";

const Home: NextPage = () => {
  const [type, setType] = useState<
    "%" | "stats" | "synonyms" | "autocomplete" | "insert"
  >("stats");
  const [status, setStatus] = useState("");
  const [prose, setProse] = useState("");
  const [autocompleteWord, setAutocompleteWord] = useState("");
  const [line, setLine] = useState(0);
  const [current, setCurrent] = useState(0);
  const [read, setRead] = useState(0.0);
  const [hidden, setHidden] = useState(false);
  const [light, setLight] = useState(false);
  const [prev, setPrev] = useState<
    "%" | "stats" | "synonyms" | "autocomplete" | "insert"
  >("stats");
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [headings, setHeadings] = useState<{ heading: string; line: number }[]>(
    []
  );

  const writer = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

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

  const moveToPrevMarker = () => {
    // todo
  };

  const moveToNextMarker = () => {
    // todo
  };

  const speedRead = () => {
    if (writer.current) writer.current.selectionStart = 0;
    if (writer.current) writer.current.selectionEnd = 0;

    const words = prose.split(" ");
    let ind = 0;
    let from = 0;

    const highlight = () => {
      if (ind > words.length) {
        clearInterval(interval);
        return;
      }

      const word = words[ind];
      const wordStart = prose.indexOf(word as string, from);
      const wordEnd = wordStart + (word?.length as number);

      writer.current?.setSelectionRange(wordStart, wordEnd);
      writer.current?.focus();

      from = wordEnd;
      ind++;
    };

    const interval = setInterval(highlight, 200);
  };

  const refetchFiles = () => {
    setStatus("refreshing files...");
    fetch("/api/files")
      .then((res) =>
        res
          .json()
          .then((data: { files: string[] }) => {
            setFiles(data.files);
            setStatus("refreshed files...");
          })
          .catch((e) => console.log(e))
      )
      .catch((e) => console.log(e));
  };

  const handleUpload = (file: File | undefined) => {
    setStatus("uploading...");
    const form = new FormData();
    form.append("file", file as File);

    fetch("/api/upload", {
      method: "POST",
      body: form,
    })
      .then((res) =>
        res
          .json()
          .then((data) => {
            refetchFiles();
          })
          .catch((e) => console.log(e))
      )
      .catch((e) => console.log(e));
  };

  const upload = (content: string, name: string) => {
    setStatus("uploading...");
    const form = new FormData();
    form.append("file", new Blob([content], { type: "text/plain" }), name);

    fetch("/api/upload", {
      method: "POST",
      body: form,
    })
      .then((res) =>
        res
          .json()
          .then((data) => {
            refetchFiles();
          })
          .catch((e) => console.log(e))
      )
      .catch((e) => console.log(e));
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

  // general shortcut handler
  useEffect(() => {
    const shortcutHandler = (e: {
      key: string;
      preventDefault(): unknown;
      ctrlKey: boolean;
      metaKey: boolean;
    }) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "\\") {
          setHidden(!hidden);
          fetch("/api/sidebar", {
            method: "POST",
          })
            .then((res) =>
              res
                .json()
                .then((data) => console.log(data))
                .catch((e) => console.log(e))
            )
            .catch((e) => console.log(e));
        } else if (e.key === "[") {
          moveToPrevMarker();
        } else if (e.key === "]") {
          moveToNextMarker();
        } else if (e.key === "k") {
          e.preventDefault();
          speedRead();
        } else if (e.key === "o") {
          e.preventDefault();
          fileInput.current?.click();
        } else if (e.key === "s") {
          e.preventDefault();
          if (files.length <= 0) {
            setStatus("guide cannot be saved...");
            return;
          }
          upload(prose, files[current] as string);
        }
      }
    };

    window.addEventListener("keydown", shortcutHandler);
    return () => window.removeEventListener("keydown", shortcutHandler);
  });

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

  // sidebar and light mode config
  useEffect(() => {
    fetch("/api/settings")
      .then((res) =>
        res
          .json()
          .then((data: { sidebar: boolean; light: boolean }) => {
            setHidden(data.sidebar);
            setLight(data.light);
          })
          .catch((e) => console.log(e))
      )
      .catch((e) => console.log(e));
  }, []);

  // file loader
  useEffect(() => {
    setStatus("refreshing files...");
    fetch("/api/files")
      .then((res) =>
        res
          .json()
          .then((data: { files: string[] }) => {
            setFiles(data.files);
            setStatus("refreshing file...");
            if (data.files.length <= 0) {
              setProse(DEFAULT_PROSE);
            } else {
              fetch("/api/file?name=" + (data.files[0] as string))
                .then((res) =>
                  res
                    .json()
                    .then((data: { content: string }) => {
                      setProse(data.content);
                      setStatus("refreshed file...");
                    })
                    .catch((e) => console.log(e))
                )
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e))
      )
      .catch((e) => console.log(e));
  }, []);

  // get currently selected file
  useEffect(() => {
    setStatus("refreshing file...");
    fetch("/api/file?name=" + (files[current] as string))
      .then((res) =>
        res
          .json()
          .then((data: { content: string }) => {
            setProse(data.content);
            setStatus("refreshed file...");
          })
          .catch((e) => console.log(e))
      )
      .catch((e) => console.log(e));
  }, [current]);

  return (
    <div
      className={`grid min-h-screen grid-cols-5 ${
        light ? "bg-basel" : "bg-base"
      } font-mono ${light ? "text-accentl" : "text-accent"}`}
    >
      <input
        className="absolute top-0 left-0 hidden h-0 w-0"
        type="file"
        ref={fileInput}
        onChange={(e) =>
          handleUpload(e.target.files ? e.target.files[0] : undefined)
        }
      />
      <div className={`w-full ${hidden ? "hidden" : ""}`}>
        <Sidebar
          headings={headings}
          line={line}
          hidden={hidden}
          light={light}
          files={files}
          current={current}
          setCurrent={setCurrent}
        />
      </div>
      <div className={`${hidden ? "col-span-5" : "col-span-4"}`}>
        <textarea
          value={prose}
          onChange={(e) => setProse(e.target.value)}
          onClick={() => setType("stats")}
          className={`h-[calc(100%-38px)] w-full resize-none ${
            light ? "bg-basel" : "bg-base"
          } py-10 px-10 text-sm outline-none`}
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
          light={light}
          status={status}
        />
      </div>
    </div>
  );
};

export default Home;
