const savedCommands = [
  {
    id: 1,
    name: "List Files",
    command: "ls",
    description: "List directory contents"
  },
  {
    id: 2,
    name: "Show Running Processes",
    command: "ps",
    description: "Display current processes"
  },
  {
    id: 3,
    name: "Device Properties",
    command: "getprop",
    description: "Get device properties"
  }
];

export const getCommands = () => {
  return savedCommands;
};

export const addCommand = (command) => {
  const newCommand = {
    id: savedCommands.length + 1,
    ...command
  };
  savedCommands.push(newCommand);
  return newCommand;
};

export const deleteCommand = (id) => {
  const index = savedCommands.findIndex(cmd => cmd.id === id);
  if (index !== -1) {
    savedCommands.splice(index, 1);
    return true;
  }
  return false;
};