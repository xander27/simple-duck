'use strict';
// @flow
import get from 'lodash.get'
import camelCase from 'lodash.camelcase'
import DuckModule from './index';
import type {RootSelector} from "./types";

function fixPrefix(prefix: string): string {
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

function createRootSelector<R>(prefix: string): RootSelector<R> {
    const path = fixPrefix(prefix)
        .slice(1, prefix.length)
        .split('/')
        .map(camelCase)
        .join('.');
    return root => get(root, path);
}

/**
 * @author xander27
 * Class for modules where name is slash-separated path to module in root state. (e.g '/MODULE_A/SUBMODULE_B')
 */
export default class SlashNamedModule<R> extends DuckModule<R> {


    /**
     * Create new slash name module
     * @param {string} prefix
     * @param {function} [rootSelector] root selector function. If not provided will try to create function based on
     * prefix. For example: for prefix '/MODULE_A/SUBMODULE_B' selector will be root => root.moduleA.submoduleB.
     * https://lodash.com/docs/#camelCase is used to convert to camelCase
     */
    constructor(prefix: string, rootSelector?: RootSelector<R>) {
        super(fixPrefix(prefix), rootSelector ? rootSelector : createRootSelector(prefix));
    }

    /**
     * Create new action with given name
     * @protected
     * @param {string} name action name
     * @return {string}
     */
    action(name: string): string {
        return this.prefix + (name.startsWith('/') ? name.slice(1, name.length) : name);
    }
}