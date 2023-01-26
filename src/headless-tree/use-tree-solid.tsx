import { createTree, INode } from "./create-tree";
import { createComputed } from "solid-js";
import { createStore } from "solid-js/store";

export const useCreateTree = ({ data }: { data: INode }) => {
  const [state, setState] = createStore({
    expanded: {
      [data.id]: true,
    },
    selected: {},
  });

  const table = createTree(data);
  table.options.onStateChange = (updater) => {
    setState(updater);
  };

  createComputed(() => {
    table.state = state;
  });

  return table;
};
