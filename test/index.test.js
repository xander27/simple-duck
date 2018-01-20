import DuckModule, {combineModules} from "../src/index"

const TEST_STATE = {
    testModule: {
        x: 0
    },
    regularModule: {
        y: 0
    }
};

const TEST_MODULE_DEFAULT_STATE = {x: 0};

/**
 * Test example of duck module
 */
class TestModule extends DuckModule {

    constructor(prefix, rootSelector) {
        super(prefix, rootSelector);
        this.INC = this.prefix + "INC"; // action name
    }

    /**
     * Create new action of this.INC type
     * @param {number} x
     * @returns {{type: string|*, payload: *}}
     */
    inc(x = 0) {
        return {type: this.INC, payload: x}
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
    reduce(state = TEST_MODULE_DEFAULT_STATE, action) {
        switch (action.type) {
            case this.INC:
                return {x: state.x + action.payload};
        }
        return super.reduce(state);
    }
}

let module = new TestModule(
    "/TEST/", // ALL actions names will start with "/TEST/".
    root => root.testModule // Base selector to get root state of module from application state
);


test("Selectors and actions", () => {
    expect(module.getX(TEST_STATE)).toBe(0);
    let newState = {
        ...TEST_STATE,
        testModule: module.reduce(module.getRoot(TEST_STATE), module.inc(1))
    };
    expect(module.getX(newState)).toBe(1);
});

test("Combine modules", () => {
    let duckModule = new TestModule("/TEST/", root => root.testModule);
    let reducer = function (state, action) {
        switch (action.type) {
            case "DEC":
                return {y: state.y - 1};
        }
        return state;
    };
    let combined = combineModules({testModule: duckModule, regularModule: reducer});
    let newState = combined(TEST_STATE, {type: "DEC"});
    newState = combined(newState, duckModule.inc(1));
    expect(newState.regularModule.y).toBe(-1);
    expect(duckModule.getX(newState)).toBe(1);
});

