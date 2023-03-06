const Sidebar = ({ hidden = false, headings, line }: Props) => {
  return (
    <div
      className={`${
        hidden ? "hidden" : ""
      } fixed top-0 bottom-0 left-0 h-screen w-80 px-8 py-24 text-sm`}
    >
      <ul className="flex flex-col gap-1">
        <li className="cursor-pointer font-bold">README.md</li>
        {headings.map((heading, ind) => (
          <li
            className={`flex cursor-pointer flex-row items-center justify-between gap-8 ${
              heading.line === line ? "text-accent" : "text-neutral"
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
      </ul>
    </div>
  );
};

interface Props {
  hidden?: boolean;
  headings: { heading: string; line: number }[];
  line: number;
}

export default Sidebar;
