'use strict';
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
     * @param state current state
     * @param {object} action
     * @returns {object} next state
     */
    reduce(state, action) {
        return state;
    }

}