"use client";
import dynamic from "next/dynamic";
import { Rnd } from "react-rnd";

const TerminalComponent = dynamic(() => import("./components/Terminal"), {
  ssr: false, // Important: Disable server-side rendering
});

export default function Home() {
  return (
    <div className="w-full h-screen">
      <Rnd
        default={{
          x: 20,
          y: 20,
          width: 600,
          height: 400,
        }}
        minWidth={200}
        minHeight={150}
        style={{
          border: "1px solid #ddd",
          background: "#f0f0f0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TerminalComponent />
      </Rnd>
    </div>
  );
}
