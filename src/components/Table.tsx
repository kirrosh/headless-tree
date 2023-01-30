import { createSignal, For } from "solid-js";
import type { ExpandedState } from "../headless-tree/features/Expanding";
import { createSolidTable } from "../headless-tree/solid";
import { getCoreRowModel } from "../headless-tree/utils/getCoreNodeModal";
import { getExpandedRowModel } from "../headless-tree/utils/getExpandedRowModel";
import { makeData } from "./makeData";

export function Table() {
  const [data, setData] = createSignal(makeData(10, 2, 2));

  const [expanded, setExpanded] = createSignal<ExpandedState>({});
  const rerender = () => setData(makeData(10, 2, 2));

  const table = createSolidTable({
    get data() {
      return data();
    },
    state: {
      get expanded() {
        return expanded();
      },
    },
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  console.log(table.getRowModel());

  console.log(expanded());
  return (
    <div class="p-2">
      <For each={table.getRowModel().rows}>
        {(row) => (
          <div
            style={{ "padding-left": `${row.depth * 20}px` }}
            class="flex gap-2"
            onclick={(e) => {
              row.toggleExpanded();
              console.log(table.getRowModel());
            }}
          >
            {row.getCanExpand() ? (
              <span class="w-4">{row.getIsExpanded() ? "-" : "+"}</span>
            ) : (
              <span class="w-4" />
            )}
            {row.getValue().firstName}
          </div>
        )}
      </For>
      <div class="h-4" />
      <button onClick={() => rerender()} class="border p-2">
        Rerender
      </button>
    </div>
  );
}
