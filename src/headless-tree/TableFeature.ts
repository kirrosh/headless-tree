import type { InitialTableState } from "./table";

export interface TableFeature {
  getDefaultOptions?: (table: any) => any;
  getInitialState?: (initialState?: InitialTableState) => any;
  createTable?: (table: any) => any;
  // getDefaultColumnDef?: () => any
  // createColumn?: (column: any, table: any) => any
  // createHeader?: (column: any, table: any) => any
  // createCell?: (cell: any, column: any, row: any, table: any) => any
  createRow?: (row: any, table: any) => any;
}
