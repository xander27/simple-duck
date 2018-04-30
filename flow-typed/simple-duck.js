
'use strict';
// @flow
declare module 'simple-duck' {
    declare class DuckModule<R> {

        prefix: string;
        rootSelector: <R>(_: any) => R;
        constructor(prefix: string, rootSelector: RootSelector<R>): void | void;
        getRoot(state: {}): R;
        reduce(state: R, action: Action): R;
    }

    declare export type Action = { type: string, payload?: any, meta?: any };
    declare export type RootSelector<R> = ({}) => R;
    declare export type ReducerFunction<R> = (R, Action) => R;
    declare export type CombinedState = {[string]: any}

    declare export default typeof DuckModule;
    declare export function combineModules<S: CombinedState>(modules: { [string]: DuckModule<any> | ReducerFunction<any> }): ReducerFunction<S>;
    declare export class SlashNamedModule<R> extends DuckModule<R> {

        action(name: string): string;
        constructor(prefix: string, rootSelector?: RootSelector<R>): void | void;
    }
}



