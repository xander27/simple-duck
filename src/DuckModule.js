
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
        this.getRoot = rootSelector && rootSelector.bind(this);
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