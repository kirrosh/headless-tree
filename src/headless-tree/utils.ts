import type { TableState, Updater } from "./table";

export type NoInfer<T> = [T][T extends any ? 0 : never];

export type RequiredKeys<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

export type PartialKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;
export type Overwrite<T, U extends { [TKey in keyof T]?: any }> = Omit<
  T,
  keyof U
> &
  U;

export function memo<TDeps extends readonly any[], TResult>(
  getDeps: () => [...TDeps],
  fn: (...args: NoInfer<[...TDeps]>) => TResult,
  opts: {
    key: any;
    debug?: () => any;
    onChange?: (result: TResult) => void;
  }
): () => TResult {
  let deps: any[] = [];
  let result: TResult | undefined;

  return () => {
    let depTime: number;
    if (opts.key && opts.debug) depTime = Date.now();

    const newDeps = getDeps();

    const depsChanged =
      newDeps.length !== deps.length ||
      newDeps.some((dep: any, index: number) => deps[index] !== dep);

    if (!depsChanged) {
      return result!;
    }

    deps = newDeps;

    let resultTime: number;
    if (opts.key && opts.debug) resultTime = Date.now();

    result = fn(...newDeps);
    opts?.onChange?.(result);

    if (opts.key && opts.debug) {
      if (opts?.debug()) {
        const depEndTime = Math.round((Date.now() - depTime!) * 100) / 100;
        const resultEndTime =
          Math.round((Date.now() - resultTime!) * 100) / 100;
        const resultFpsPercentage = resultEndTime / 16;

        const pad = (str: number | string, num: number) => {
          str = String(str);
          while (str.length < num) {
            str = " " + str;
          }
          return str;
        };

        console.info(
          `%c⏱ ${pad(resultEndTime, 5)} /${pad(depEndTime, 5)} ms`,
          `
              font-size: .6rem;
              font-weight: bold;
              color: hsl(${Math.max(
                0,
                Math.min(120 - 120 * resultFpsPercentage, 120)
              )}deg 100% 31%);`,
          opts?.key
        );
      }
    }

    return result!;
  };
}

export function functionalUpdate<T>(updater: Updater<T>, input: T): T {
  return typeof updater === "function"
    ? (updater as (input: T) => T)(input)
    : updater;
}

export function makeStateUpdater<K extends keyof TableState>(
  key: K,
  instance: unknown
) {
  return (updater: Updater<TableState[K]>) => {
    (instance as any).setState(<TTableState>(old: TTableState) => {
      return {
        ...old,
        [key]: functionalUpdate(updater, (old as any)[key]),
      };
    });
  };
}
