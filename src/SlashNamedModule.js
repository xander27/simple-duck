'use strict';
import get from 'lodash.get'
import camelCase from 'lodash.camelcase'

import DuckModule from './index';

function fixPrefix(prefix) {
    if (!prefix) {
        throw Error(`Invalid prefix '${prefix}'`);
    }
    let result = prefix;
    if (!result.endsWith('/')) {
        result = result + '/';
    }
    if(!result.startsWith('/')){
        result = '/' + result;
    }
    return result;
}

function createRootSelector(prefix) {
    const path = prefix
        .slice(1, prefix.length - 1)
        .split('/')
        .map(camelCase)
        .join('.');
    return root => get(root, path);
}

/**
 * @author xander27
 * Class for modules where name is slash-separated path to module in root state. (e.g '/MODULE_A/SUBMODULE_B')
 */
export default class SlashNamedModule extends DuckModule {


    /**
     * Create new slash name module
     * @param {string} prefix
     * @param {function} [rootSelector] root selector function. If not provided will try to create function based on
     * prefix. For example: for prefix '/MODULE_A/SUBMODULE_B' selector will be root => root.moduleA.submoduleB.
     * https://lodash.com/docs/#camelCase is used to convert to camelCase
     */
    constructor(prefix, rootSelector) {
        super(fixPrefix(prefix), rootSelector);
        if(!this.getRoot){
            this.getRoot = createRootSelector(this.prefix);
        }
    }

    /**
     * Create new action with given name
     * @protected
     * @param {string} name action name
     * @return {string}
     */
    action(name) {
        return this.prefix + (name.startsWith('/') ? name.slice(1, name.length) : name);
    }
}