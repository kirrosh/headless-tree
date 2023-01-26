import type { INode } from "../headless-tree/create-tree";
import { useCreateTree } from "../headless-tree/use-tree-solid";
import { TreeNode } from "./Node";

var treeData: INode = {
  name: "Root",
  id: "1",
  children: [
    {
      name: "Child 1",
      id: "1-1",
      children: [
        { name: "Grandchild 1", id: "1-1-1" },
        { name: "Grandchild 2", id: "1-1-2" },
      ],
    },
    {
      name: "Child 2",
      id: "2",
    },
  ],
};

export const Tree = () => {
  const tree = useCreateTree({ data: treeData });
  return (
    <div>
      <TreeNode {...tree.root} />
    </div>
  );
};
