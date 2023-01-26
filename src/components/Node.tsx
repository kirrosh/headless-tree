import { For } from "solid-js";
import type { ITreeNode } from "../headless-tree/create-tree";

type NodeProps = ITreeNode;

export const TreeNode = (props: NodeProps) => {
  return (
    <div>
      <span
        style={{
          display: "flex",
          cursor: "pointer",
        }}
      >
        <span
          class="w-6"
          onclick={() => {
            props.canBeExpanded() && props.toggleExpanded();
          }}
        >
          {props.canBeExpanded() ? (props.getIsExpanded() ? "-" : "+") : ""}
        </span>
        <input
          type="checkbox"
          onChange={(e) => {
            props.toggleSelected();
          }}
          checked={props.getIsSelected()}
        />
        <span
          onClick={() => {
            props.canBeExpanded() && props.toggleExpanded();
          }}
        >
          {props.name}
        </span>
      </span>
      <div class="pl-4">
        {props.getIsExpanded() && (
          <For each={props.children}>{(root) => <TreeNode {...root} />}</For>
        )}
      </div>
    </div>
  );
};
