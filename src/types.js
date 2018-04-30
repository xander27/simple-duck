// @flow
export type Action = { type: string, payload?: any, meta?: any };

export type RootSelector<R> = (any) => R;

export type ReducerFunction<R> = (R, Action) => R;

export type CombinedState = {[string]: any}