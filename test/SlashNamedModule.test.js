// @flow

import { SlashNamedModule } from '../lib/index'
const { test, expect } = global;

const TEST_STATE = {
    parentModule: {
        testModule: { x: 0 }
    }
};

/**
 * Test example of duck module
 */
class TestModule extends SlashNamedModule {

    constructor(prefix) {
        super(prefix);
        this.INC = this.action('INC')
    }

    /**
     * Create new action of this.INC type
     * @param {number} x
     * @returns {{type: string|*, payload: *}}
     */
    inc(x) {
        return { type: this.INC, payload: x }
    }

    /**
     * Selector for X value
     * @param state
     */
    getX(state) {
        return this.getRoot(state).x;
    }

    /**
     * Reducer function
     */
    reduce(state, action) {
        switch (action.type) {
            case this.INC:
                return { x: state.x + action.payload };
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
