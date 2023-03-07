import { Dispatch, SetStateAction } from "react";

const Sidebar = ({
  hidden = false,
  headings,
  line,
  light,
  files,
  current,
  setCurrent,
}: Props) => {
  return (
    <div
      className={`${
        hidden ? "hidden" : ""
      } fixed top-0 bottom-0 left-0 h-screen w-80 px-8 py-24 text-sm`}
    >
      <ul className="flex flex-col gap-1">
        {files.length <= 0 ? (
          <>
            <li className="cursor-pointer font-bold">Splash</li>
            {headings.map((heading, ind) => (
              <li
                className={`flex cursor-pointer flex-row items-center justify-between gap-8 ${
                  heading.line === line
                    ? light
                      ? "text-accentl"
                      : "text-accent"
                    : light
                    ? "text-neutrall"
                    : "text-neutral"
                }`}
                key={ind}
              >
                <div>
                  {heading.heading.startsWith("# ")
                    ? heading.heading.replace("# ", "")
                    : heading.heading.startsWith("##")
                    ? heading.heading.replace("## ", "- ")
                    : heading.heading.replace("-- ", "-- ")}
                </div>
                <div>{heading.line}</div>
              </li>
            ))}
          </>
        ) : (
          files.map((file, ind) => (
            <>
              <li
                className={`${
                  ind === current
                    ? light
                      ? "text-accentl"
                      : "text-accent"
                    : light
                    ? "text-neutrall"
                    : "text-neutral"
                } cursor-pointer font-bold`}
                key={ind}
                onClick={() => setCurrent(ind)}
              >
                {file}
              </li>
              {ind === current
                ? headings.map((heading, ind) => (
                    <li
                      className={`flex cursor-pointer flex-row items-center justify-between gap-8 ${
                        heading.line === line
                          ? light
                            ? "text-accentl"
                            : "text-accent"
                          : light
                          ? "text-neutrall"
                          : "text-neutral"
                      }`}
                      key={ind}
                    >
                      <div>
                        {heading.heading.startsWith("# ")
                          ? heading.heading.replace("# ", "")
                          : heading.heading.startsWith("##")
                          ? heading.heading.replace("## ", "- ")
                          : heading.heading.replace("-- ", "-- ")}
                      </div>
                      <div>{heading.line}</div>
                    </li>
                  ))
                : null}
            </>
          ))
        )}
      </ul>
    </div>
  );
};

interface Props {
  hidden?: boolean;
  headings: { heading: string; line: number }[];
  line: number;
  light: boolean;
  files: string[];
  current: number;
  setCurrent: Dispatch<SetStateAction<number>>
}

export default Sidebar;
