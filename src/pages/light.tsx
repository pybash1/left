import type { NextPage } from "next";
import { useEffect } from "react";
import { env } from "~/env.mjs";

const Light: NextPage = () => {
  useEffect(() => {
    fetch(
      env.NEXT_PUBLIC_NODE_ENV === "dev"
        ? "http://localhost:8000/light"
        : "/api/light",
      {
        method: "POST",
      }
    )
      .then((res) =>
        res
          .json()
          .then((data) => console.log(data))
          .catch((e) => console.log(e))
      )
      .catch((e) => console.log(e));
    window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  });

  return <></>;
};

export default Light;
