import {
  ExpandedInstance,
  ExpandedOptions,
  ExpandedRow,
  ExpandedTableState,
  Expanding,
} from "./features/Expanding";
import { functionalUpdate, PartialKeys, RequiredKeys } from "./utils";

export type RowData = unknown | object | any[];
export type Updater<T> = T | ((old: T) => T);
export type OnChangeFn<T> = (updaterOrValue: Updater<T>) => void;

export interface CoreRow<TData extends RowData> {
  id: string;
  index: number;
  original: TData;
  depth: number;
  // _valuesCache: Record<string, unknown>
  // _uniqueValuesCache: Record<string, unknown>
  getValue: () => TData;
  // getUniqueValues: (columnId: string) => TData[]
  renderValue: () => TData;
  subRows: Row<TData>[];
  //   getLeafRows: () => Row<TData>[];
  originalSubRows?: TData[];
  // getAllCells: () => Cell<TData, unknown>[]
  // _getAllCellsByColumnId: () => Record<string, Cell<TData, unknown>>
}

export interface CoreTableState {}

// export type TableOptionsResolved<TData extends RowData> = CoreOptions<TData> &
//   FeatureOptions<TData>

export interface CoreOptions<TData extends RowData> {
  data: TData[];
  state: Partial<TableState>;
  onStateChange: (updater: Updater<TableState>) => void;
  debugAll?: boolean;
  debugTable?: boolean;
  debugHeaders?: boolean;
  debugColumns?: boolean;
  debugRows?: boolean;
  initialState?: InitialTableState;
  autoResetAll?: boolean;
  mergeOptions?: (
    defaultOptions: TableOptions<TData>,
    options: Partial<TableOptions<TData>>
  ) => TableOptions<TData>;
  //   meta?: TableMeta<TData>
  getCoreRowModel: (table: Table<any>) => () => RowModel<any>;
  getSubRows?: (originalRow: TData, index: number) => undefined | TData[];
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
  // columns: ColumnDef<TData, any>[]
  // defaultColumn?: Partial<ColumnDef<TData, unknown>>
  renderFallbackValue: any;
}

export interface TableState extends CoreTableState, ExpandedTableState {}
// VisibilityTableState,
// ColumnOrderTableState,
// ColumnPinningTableState,
// FiltersTableState,
// SortingTableState,
// ExpandedTableState,
// GroupingTableState,
// ColumnSizingTableState,
// PaginationTableState,
// RowSelectionTableState {}

interface FeatureOptions<TData extends RowData>
  extends CoreTableState,
    ExpandedOptions<TData> {}
//   extends VisibilityOptions,
//     ColumnOrderOptions,
//     ColumnPinningOptions,
//     FiltersOptions<TData>,
//     SortingOptions<TData>,
//     GroupingOptions,
//     ExpandedOptions<TData>,
//     ColumnSizingOptions,
//     PaginationOptions,
//     RowSelectionOptions<TData> {}

interface CompleteInitialTableState
  extends CoreTableState,
    ExpandedTableState {}
// VisibilityTableState,
// ColumnOrderTableState,
// ColumnPinningTableState,
// FiltersTableState,
// SortingTableState,
// ExpandedTableState,
// GroupingTableState,
// ColumnSizingTableState,
// PaginationInitialTableState,
// RowSelectionTableState {}

export interface InitialTableState extends Partial<CompleteInitialTableState> {}

export interface TableFeature {
  getDefaultOptions?: (table: any) => any;
  getInitialState?: (initialState?: InitialTableState) => any;
  createTable?: (table: any) => any;
  getDefaultColumnDef?: () => any;
  createColumn?: (column: any, table: any) => any;
  createHeader?: (column: any, table: any) => any;
  createCell?: (cell: any, column: any, row: any, table: any) => any;
  createRow?: (row: any, table: any) => any;
}

export type TableOptionsResolved<TData extends RowData> = CoreOptions<TData> &
  FeatureOptions<TData>;

export interface TableOptions<TData extends RowData>
  extends PartialKeys<
    TableOptionsResolved<TData>,
    "state" | "onStateChange" | "renderFallbackValue"
  > {}

export interface CoreInstance<TData extends RowData> {
  initialState: TableState;
  reset: () => void;
  options: RequiredKeys<TableOptionsResolved<TData>, "state">;
  setOptions: (newOptions: Updater<TableOptionsResolved<TData>>) => void;
  getState: () => TableState;
  setState: (updater: Updater<TableState>) => void;
  _features: readonly TableFeature[];
  _queue: (cb: () => void) => void;
  _getRowId: (_: TData, index: number, parent?: Row<TData>) => string;
  getCoreRowModel: () => RowModel<TData>;
  _getCoreRowModel?: () => RowModel<TData>;
  getRowModel: () => RowModel<TData>;
  getRow: (id: string) => Row<TData>;
  //   _getDefaultColumnDef: () => Partial<ColumnDef<TData, unknown>>;
  //   _getColumnDefs: () => ColumnDef<TData, unknown>[];
  //   _getAllFlatColumnsById: () => Record<string, Column<TData, unknown>>;
  //   getAllColumns: () => Column<TData, unknown>[];
  //   getAllFlatColumns: () => Column<TData, unknown>[];
  //   getAllLeafColumns: () => Column<TData, unknown>[];
  //   getColumn: (columnId: string) => Column<TData, unknown> | undefined;
}

export interface Row<TData extends RowData>
  extends CoreRow<TData>,
    ExpandedRow {}
// VisibilityRow<TData>,
// ColumnPinningRow<TData>,
// FiltersRow<TData>,
// GroupingRow,
// RowSelectionRow,
// ExpandedRow {}

export interface Table<TData extends RowData>
  extends CoreInstance<TData>,
    ExpandedInstance<TData> {}
// HeadersInstance<TData>,
// VisibilityInstance<TData>,
// ColumnOrderInstance<TData>,
// ColumnPinningInstance<TData>,
// FiltersInstance<TData>,
// SortingInstance<TData>,
// GroupingInstance<TData>,
// ColumnSizingInstance,
// ExpandedInstance<TData>,
// PaginationInstance<TData>,
// RowSelectionInstance<TData> {}

export interface RowModel<TData extends RowData> {
  rows: Row<TData>[];
  flatRows: Row<TData>[];
  rowsById: Record<string, Row<TData>>;
}

const features = [Expanding] as const;

export function createTable<TData extends RowData>(
  options: TableOptionsResolved<TData>
): Table<TData> {
  if (options.debugAll || options.debugTable) {
    console.info("Creating Table Instance...");
  }

  let table = { _features: features } as unknown as Table<TData>;

  const defaultOptions = table._features.reduce((obj, feature) => {
    return Object.assign(obj, feature.getDefaultOptions?.(table));
  }, {}) as TableOptionsResolved<TData>;

  const mergeOptions = (options: TableOptionsResolved<TData>) => {
    if (table.options.mergeOptions) {
      return table.options.mergeOptions(defaultOptions, options);
    }

    return {
      ...defaultOptions,
      ...options,
    };
  };

  const coreInitialState: CoreTableState = {};

  let initialState = {
    ...coreInitialState,
    ...(options.initialState ?? {}),
  } as TableState;

  table._features.forEach((feature) => {
    initialState = feature.getInitialState?.(initialState) ?? initialState;
  });

  const queued: (() => void)[] = [];
  let queuedTimeout = false;

  const coreInstance: CoreInstance<TData> = {
    _features: features,
    options: {
      ...defaultOptions,
      ...options,
    },
    initialState,
    _queue: (cb) => {
      queued.push(cb);

      if (!queuedTimeout) {
        queuedTimeout = true;

        // Schedule a microtask to run the queued callbacks after
        // the current call stack (render, etc) has finished.
        Promise.resolve()
          .then(() => {
            while (queued.length) {
              queued.shift()!();
            }
            queuedTimeout = false;
          })
          .catch((error) =>
            setTimeout(() => {
              throw error;
            })
          );
      }
    },
    reset: () => {
      table.setState(table.initialState);
    },
    setOptions: (updater) => {
      const newOptions = functionalUpdate(updater, table.options);
      table.options = mergeOptions(newOptions) as RequiredKeys<
        TableOptionsResolved<TData>,
        "state"
      >;
    },

    getState: () => {
      return table.options.state as TableState;
    },

    setState: (updater: Updater<TableState>) => {
      console.log("setState", updater);
      table.options.onStateChange?.(updater);
    },

    _getRowId: (row: TData, index: number, parent?: Row<TData>) =>
      table.options.getRowId?.(row, index, parent) ??
      `${parent ? [parent.id, index].join(".") : index}`,

    getCoreRowModel: () => {
      if (!table._getCoreRowModel) {
        table._getCoreRowModel = table.options.getCoreRowModel(table);
      }

      return table._getCoreRowModel!();
    },

    // The final calls start at the bottom of the model,
    // expanded rows, which then work their way up

    getRowModel: () => {
      console.log("getRowModel", table.getExpandedRowModel());
      return table.getExpandedRowModel();
      // return table.getPaginationRowModel()
    },
    getRow: (id: string) => {
      const row = table.getRowModel().rowsById[id];

      if (!row) {
        if (process.env.NODE_ENV !== "production") {
          throw new Error(`getRow expected an ID, but got ${id}`);
        }
        throw new Error();
      }

      return row;
    },
    // _getDefaultColumnDef: memo(
    //   () => [table.options.defaultColumn],
    //   defaultColumn => {
    //     defaultColumn = (defaultColumn ?? {}) as Partial<
    //       ColumnDef<TData, unknown>
    //     >

    //     return {
    //       header: props => {
    //         const resolvedColumnDef = props.header.column
    //           .columnDef as ColumnDefResolved<TData>

    //         if (resolvedColumnDef.accessorKey) {
    //           return resolvedColumnDef.accessorKey
    //         }

    //         if (resolvedColumnDef.accessorFn) {
    //           return resolvedColumnDef.id
    //         }

    //         return null
    //       },
    //       // footer: props => props.header.column.id,
    //       cell: props => props.renderValue<any>()?.toString?.() ?? null,
    //       ...table._features.reduce((obj, feature) => {
    //         return Object.assign(obj, feature.getDefaultColumnDef?.())
    //       }, {}),
    //       ...defaultColumn,
    //     } as Partial<ColumnDef<TData, unknown>>
    //   },
    //   {
    //     debug: () => table.options.debugAll ?? table.options.debugColumns,
    //     key: process.env.NODE_ENV === 'development' && 'getDefaultColumnDef',
    //   }
    // ),

    // _getColumnDefs: () => table.options.columns,

    // getAllColumns: memo(
    //   () => [table._getColumnDefs()],
    //   columnDefs => {
    //     const recurseColumns = (
    //       columnDefs: ColumnDef<TData, unknown>[],
    //       parent?: Column<TData, unknown>,
    //       depth = 0
    //     ): Column<TData, unknown>[] => {
    //       return columnDefs.map(columnDef => {
    //         const column = createColumn(table, columnDef, depth, parent)

    //         const groupingColumnDef = columnDef as GroupColumnDef<
    //           TData,
    //           unknown
    //         >

    //         column.columns = groupingColumnDef.columns
    //           ? recurseColumns(groupingColumnDef.columns, column, depth + 1)
    //           : []

    //         return column
    //       })
    //     }

    //     return recurseColumns(columnDefs)
    //   },
    //   {
    //     key: process.env.NODE_ENV === 'development' && 'getAllColumns',
    //     debug: () => table.options.debugAll ?? table.options.debugColumns,
    //   }
    // ),

    // getAllFlatColumns: memo(
    //   () => [table.getAllColumns()],
    //   allColumns => {
    //     return allColumns.flatMap(column => {
    //       return column.getFlatColumns()
    //     })
    //   },
    //   {
    //     key: process.env.NODE_ENV === 'development' && 'getAllFlatColumns',
    //     debug: () => table.options.debugAll ?? table.options.debugColumns,
    //   }
    // ),

    // _getAllFlatColumnsById: memo(
    //   () => [table.getAllFlatColumns()],
    //   flatColumns => {
    //     return flatColumns.reduce((acc, column) => {
    //       acc[column.id] = column
    //       return acc
    //     }, {} as Record<string, Column<TData, unknown>>)
    //   },
    //   {
    //     key: process.env.NODE_ENV === 'development' && 'getAllFlatColumnsById',
    //     debug: () => table.options.debugAll ?? table.options.debugColumns,
    //   }
    // ),

    // getAllLeafColumns: memo(
    //   () => [table.getAllColumns(), table._getOrderColumnsFn()],
    //   (allColumns, orderColumns) => {
    //     let leafColumns = allColumns.flatMap(column => column.getLeafColumns())
    //     return orderColumns(leafColumns)
    //   },
    //   {
    //     key: process.env.NODE_ENV === 'development' && 'getAllLeafColumns',
    //     debug: () => table.options.debugAll ?? table.options.debugColumns,
    //   }
    // ),

    // getColumn: columnId => {
    //   const column = table._getAllFlatColumnsById()[columnId]

    //   if (process.env.NODE_ENV !== 'production' && !column) {
    //     console.error(`[Table] Column with id '${columnId}' does not exist.`)
    //   }

    //   return column
    // },
  };

  Object.assign(table, coreInstance);

  table._features.forEach((feature) => {
    return Object.assign(table, feature.createTable?.(table));
  });

  return table;
}
