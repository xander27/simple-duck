// @flow

import {SlashNamedModule} from '../lib/index'
import type {Action} from '../lib/index';
const {test, expect} = global;

type SlashNamedModuleState = {| x: number |};

const TEST_STATE = {
    parentModule: {
        testModule: {x: 0}
    }
};


/**
 * Test example of duck module
 */
class TestModule extends SlashNamedModule<SlashNamedModuleState> {

    INC: string;

    constructor(prefix: string) {
        super(prefix);
        this.INC = this.action('INC')
    }

    /**
     * Create new action of this.INC type
     * @param {number} x
     * @returns {{type: string|*, payload: *}}
     */
    inc(x: number = 0): Action {
        return {type: this.INC, payload: x}
    }

    /**
     * Selector for X value
     * @param state
     */
    getX(state: {}): number {
        return this.getRoot(state).x;
    }


    /**
     * Reducer function
     */
    reduce(state = {x: 0}, action: Action): SlashNamedModuleState {
        switch (action.type) {
            case this.INC:
                return {x: state.x + action.payload};
        }
        return super.reduce(state, action);
    }
}


test('Selectors and actions', () => {
    let module = new TestModule('PARENT_MODULE/TEST_MODULE/');
    expect(module.getX(TEST_STATE)).toBe(0);
    expect(module.prefix).toBe('/PARENT_MODULE/TEST_MODULE/');
    let newState = {
        ...TEST_STATE,
        parentModule: {
            ...TEST_STATE.parentModule,
            testModule: module.reduce(module.getRoot(TEST_STATE), module.inc(1))
        }
    };
    expect(module.getX(newState)).toBe(1);
});

test('Name fixing', () => {
    let module = new TestModule('PARENT_MODULE/TEST_MODULE/');
    expect(module.prefix).toBe('/PARENT_MODULE/TEST_MODULE/');
    module = new TestModule('/PARENT_MODULE/TEST_MODULE');
    expect(module.prefix).toBe('/PARENT_MODULE/TEST_MODULE/');
    module = new TestModule('PARENT_MODULE/TEST_MODULE');
    expect(module.prefix).toBe('/PARENT_MODULE/TEST_MODULE/');
});
