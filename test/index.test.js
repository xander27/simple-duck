import DuckModule, {combineModules} from "../src/index"

const TEST_STATE = {
    testModule: {
        x: 0
    },
    regularModule: {
        y: 0
    }
};

class TestModule extends DuckModule {

    constructor() {
        super("/TEST/", root => root.testModule);
        this.INC = this.prefix + "INC";
    }

    inc() {
        return {type: this.INC}
    }

    getX(state) {
        return this.getRoot(state).x;
    }


    reduce(state, action) {
        switch (action.type) {
            case this.INC:
                return {x: state.x + 1};
        }
        return state;
    }
}

test("Selectors and actions", () => {
    let module = new TestModule();
    expect(module.getX(TEST_STATE)).toBe(0);
    let newState = {
        ...TEST_STATE,
        testModule: module.reduce(module.getRoot(TEST_STATE), module.inc())
    };
    expect(module.getX(newState)).toBe(1);
});

test("Combine modules", () => {
    let duckModule = new TestModule();
    let reducer = function (state, action) {
        switch (action.type) {
            case "DEC":
                return {y: state.y - 1};
        }
        return state;
    };
    let combined = combineModules({testModule: duckModule, regularModule: reducer});
    let newState = combined(TEST_STATE, {type: "DEC"});
    newState = combined(newState, duckModule.inc());
    expect(newState.regularModule.y).toBe(-1);
    expect(duckModule.getX(newState)).toBe(1);
});