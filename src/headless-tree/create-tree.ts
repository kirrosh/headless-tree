export type Updater<T> = T | ((old: T) => T);

export type INode = {
  id: string;
  name: string;
  children?: INode[];
};

type IState = {
  expanded: Record<string, boolean>;
  selected: Record<string, boolean>;
};

export type ITreeNode = {
  id: string;
  name: string;
  getState: () => IState;
  setExpanded: (value: boolean) => void;
  getIsExpanded: () => boolean;
  getIsSelected: () => boolean;
  canBeExpanded: () => boolean;
  toggleExpanded: () => void;
  toggleSelected: () => void;
  children?: ITreeNode[];
};

export type ITree = {
  state: IState;
  children: ITreeNode[];
  options: {
    onStateChange?: (updater: Updater<any>) => void;
    onExpandedChange: (updater: Updater<any>) => void;
    onSelectedChange: (updater: Updater<any>) => void;
  };
  root: ITreeNode;
  setState: (updater: Updater<IState>) => void;
  getState: () => IState;
};

export function functionalUpdate<T>(updater: Updater<T>, input: T): T {
  return typeof updater === "function"
    ? (updater as (input: T) => T)(input)
    : updater;
}

export function makeStateUpdater<K extends keyof IState>(
  key: K,
  instance: unknown
) {
  return (updater: Updater<IState[K]>) => {
    (instance as any).setState(<TTableState>(old: TTableState) => {
      console.log("old", { ...old });
      return {
        ...old,
        [key]: functionalUpdate(updater, (old as any)[key]),
      };
    });
  };
}

export const createTree = (rootNode: INode) => {
  const tree = {} as ITree;

  const children: ITreeNode[] = [];
  const options: ITree["options"] = {
    onExpandedChange: makeStateUpdater("expanded", tree),
    onSelectedChange: makeStateUpdater("selected", tree),
  };
  const setState = (updater: Updater<IState>) => {
    options.onStateChange?.(updater);
  };

  const createNode = (node: INode) => {
    const treeNode = {
      id: node.id,
      name: node.name,
      toggleExpanded: () => {
        tree?.options?.onExpandedChange((prev: any) => {
          const value = prev[node.id] || false;
          return {
            ...prev,
            [node.id]: !value,
          };
        });
      },
      toggleSelected: () => {
        tree?.options?.onSelectedChange((prev: any) => {
          const value = prev[node.id] || false;
          return {
            ...prev,
            [node.id]: !value,
          };
        });
      },
      getIsExpanded: (): boolean => {
        return tree.state.expanded[node.id] || false;
      },
      getIsSelected: (): boolean => {
        return tree.state.selected[node.id] || false;
      },
      canBeExpanded: (): boolean => {
        return !!node.children;
      },
      children: node.children?.map((item) => createNode(item)),
    } as ITreeNode;

    return treeNode;
  };

  tree.state = {} as IState;
  tree.children = children;
  tree.options = options;
  tree.setState = setState;
  tree.getState = () => tree.state;

  const root = createNode(rootNode);

  tree.root = root;

  return tree;
};
