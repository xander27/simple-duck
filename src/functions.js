'use strict';
// @flow

import type {Action, ReducerFunction, CombinedState} from "./types";
import DuckModule from "./DuckModule";


/**
 * Based on https://github.com/wesleytodd/combine-reducers/blob/master/src/index.js
 * @param {object} reducers
 * @returns {function}
 */
function combineReducers<S: CombinedState>(reducers: {[string]: ReducerFunction<any>}): ReducerFunction<S> {
    let reducerKeys = Object.keys(reducers);
    return (state: S, action: Action): any => {
        let hasChanged = false;
        let nextState = {};
        for (let i = 0; i < reducerKeys.length; i++) {
            let key = reducerKeys[i];
            nextState[key] = reducers[key](state[key], action);
            hasChanged = hasChanged || nextState[key] !== state[key];
        }
        return hasChanged ? nextState : state;
    };
}

/**
 * Combine duck module. May also take regular reducers
 * @param {object} modules
 * @returns {function}
 */
export function combineModules<S: CombinedState>(modules: {[string]: DuckModule<any>|ReducerFunction<any>}): ReducerFunction<S> {
    let result = {};
    for (let key of Object.keys(modules)) {
        let module: DuckModule<any> | ReducerFunction<any> = modules[key];
        if (typeof module === 'function') {
            result[key] = module;
            continue;
        }
        if (!module) {
            throw Error(`Combine modules problem: "${key}" module is "${module}"`)
        } else if (!module.reduce) {
            throw Error(`Combine modules problem: "${key}" module.reduce is "${module.reduce}"`)
        }
        result[key] = module.reduce.bind(module)
    }
    return combineReducers(result);
}

