interface AvailableCommands {
  pwd: () => string;
  cd: (tokens: string[]) => string | null;
  echo: (tokens: string[]) => string;
  clear: () => { clear: boolean };
  history: () => string;
  help: () => string;
  mycommand: () => string;
}

interface NestedCommands {
  mycommand: {
    list: () => string;
    info: () => string;
    exit: () => string;
  };
}

export type { AvailableCommands, NestedCommands };