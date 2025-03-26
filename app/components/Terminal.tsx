"use client";
import React, { useEffect, useRef, useState } from "react";
import type { AvailableCommands, NestedCommands } from "../data/command";

const BashTerminal: React.FC = () => {
  const [cmd, setCmd] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [nestedMode, setNestedMode] = useState<keyof NestedCommands | null>(
    null
  );

  const hostname = "terminal";
  const username = "terminal";
  const [directory, setDirectory] = useState<string>("~");

  const print = (text: string, currentOutput: string): string => {
    return currentOutput + text;
  };

  const command = (outputText: string, currentOutput: string): string => {
    const text = `${outputText}\n${username}@${hostname} ${directory} $ `;
    return print(text, currentOutput);
  };

  const empty = (currentOutput = ""): string => {
    const text = `${username}@${hostname} ${directory} $ `;
    return print(text, currentOutput);
  };

  const setup = (): string => {
    return empty();
  };

  const cd = (dir: string, param: string | undefined): string => {
    if (param === undefined) {
      return "~";
    }
    if (param.charAt(0) === "/") {
      return param;
    }
    return `${dir}/${param}`;
  };

  const availableCommands: AvailableCommands = {
    pwd: () => directory,
    cd: (tokens) => {
      setDirectory(cd(directory, tokens[1]));
      return null;
    },
    echo: (tokens) => tokens.slice(1).join(" "),
    clear: () => ({ clear: true }),
    history: () => history.join("\n"),
    help: () =>
      "Available commands: clear, echo, cd, pwd, history, help, mycommand",
    mycommand: () => {
      setNestedMode("mycommand");
      return "Entered mycommand mode. Type 'list', 'info', or 'exit'.";
    },
  };

  const nestedCommands: NestedCommands = {
    mycommand: {
      list: () => "Item 1, Item 2, Item 3",
      info: () => "This is info within mycommand.",
      exit: () => {
        setNestedMode(null);
        return `\n${username}@${hostname} ${directory} $ `;
      },
    },
  };

  const run = async (
    cmd: string
  ): Promise<string | { clear: boolean } | null> => {
    const tokens = cmd.split(" ");
    const commandName = tokens[0];

    if (nestedMode) {
      if (
        nestedCommands[nestedMode] &&
        commandName in nestedCommands[nestedMode]
      ) {
        const nestedModeObject = nestedCommands[nestedMode];
        if (
          typeof nestedModeObject === "object" &&
          nestedModeObject !== null &&
          commandName in nestedModeObject
        ) {
          return nestedModeObject[
            commandName as keyof typeof nestedModeObject
          ]();
        }
      }
      return `Command not found in ${nestedMode}: ${commandName}`;
    }

    if (commandName in availableCommands) {
      const result =
        availableCommands[commandName as keyof typeof availableCommands](
          tokens
        );
      if (result instanceof Promise) {
        return await result;
      }
      return result;
    }

    return commandName ? `Command not found: ${commandName}` : "";
  };

  useEffect(() => {
    setOutput(setup());
    terminalRef.current?.focus();
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTo({
        top: terminalRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [output]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey && e.shiftKey && e.key === "V") {
      e.preventDefault();
      navigator.clipboard
        .readText()
        .then((text) => {
          setCmd((prev) => prev + text);
        })
        .catch((err) => {
          console.error("Clipboard access failed:", err);
          alert(
            "Clipboard access denied. Please check your browser permissions."
          );
        });
      return;
    }

    if (e.key === "Backspace") {
      e.preventDefault();
      setCmd((prev) => prev.slice(0, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmdToRun = cmd.trim();

      if (cmdToRun) {
        setHistory((prev) => [...prev, cmdToRun]);
        const result = await run(cmdToRun.toLowerCase());

        setOutput((prev) => {
          const commandLine = `${username}@${hostname} ${directory} $ ${cmdToRun}`;
          let resultOutput: string | { clear: boolean } | null = "";

          if (result === null) {
            resultOutput = `${username}@${hostname} ${directory} $ `;
          } else if (typeof result === "object" && result.clear) {
            return empty();
          } else {
            resultOutput =
              typeof result === "string" && result.includes("\n")
                ? result
                : `\n${command(typeof result === "string" ? result : "", "")}`;
          }

          const lastPromptIndex = prev.lastIndexOf(
            `${username}@${hostname} ${directory} $ `
          );
          const cleanedPrev =
            lastPromptIndex !== -1 ? prev.substring(0, lastPromptIndex) : prev;

          return (
            cleanedPrev +
            commandLine +
            (typeof resultOutput === "string" ? resultOutput : "")
          );
        });
      } else {
        setOutput((prev) => empty(prev));
      }

      setCmd("");
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      setCmd((prev) => prev + e.key);
    }
  };

  return (
    <div
      className="flex flex-col w-full h-full p-4 bg-gray-900 text-green-400 font-mono border border-gray-700 shadow-lg overflow-hidden"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      ref={terminalRef}
    >
      <div className="flex items-center bg-gray-800 px-4 py-2 border-b border-gray-700">
        <div className="flex space-x-2 mr-4">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="text-sm text-gray-400">bash</div>
      </div>
      <pre className="flex-1 p-4 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap break-words">
        {output}
        <span className="inline-flex items-center">
          {cmd}
          <span className="ml-1 w-2 h-5 bg-green-400 animate-pulse">|</span>
        </span>
      </pre>
    </div>
  );
};

export default BashTerminal;
