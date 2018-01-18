/**
 * @author xander27
 * Base class for simple Duck module
 */
export default class DuckModule {

    /**
     * Construct new Duck module
     * @param {string} prefix prefix for actions
     * @param {function} rootSelector selector function to select root of module state from global state
     */
    constructor(prefix, rootSelector) {
        if (!prefix.endsWith("/")) {
            prefix += "/";
        }
        this.prefix = prefix;
        this.rootSelector = rootSelector;
    }

    /**
     * Select root of module state from global state
     * @protected
     * @param {object} state global state
     * @return {object} module state
     */
    getRoot(state) {
        return this.rootSelector(state);
    }

    /**
     * Reducer function of module
     * @param {object} state current state
     * @param {object} action
     * @returns {object} next state
     */
    reduce(state, action) {
        return state;
    }

}


/**
 * Based on https://github.com/wesleytodd/combine-reducers/blob/master/src/index.js
 * @param {object} reducers
 * @returns {function}
 */
function combineReducers(reducers = {}) {
    let reducerKeys = Object.keys(reducers);
    return function combination(state = {}, action) {
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
export function combineModules(modules) {
    let result = {};
    for (let key of Object.keys(modules)) {
        let module = modules[key];
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