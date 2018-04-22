#  simple-duck
Base class and helper functions Redux modules using the [ducks-modular-redux](https://github.com/erikras/ducks-modular-redux/) idea.

## Installation
```bash
npm i -S simple-duck
```

## Examples
### Define module
```javascript
import DuckModule from "simple-duck"
/**
 * Test example of duck module
 */
class TestModule extends DuckModule {

    constructor(prefix, rootSelector) {
        super(prefix, rootSelector);
        //define actions here
        this.INC = this.prefix + "INC"; // action name
    }

    /**
     * Create new action of this.INC type
     */
    inc(x) {
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
    reduce(state = {x: 0}, action) {
        switch (action.type) {
            case this.INC:
                return {x: state.x + action.payload};
        }
        return super.reduce(state, action);
    }
}

// Create module instance
let module = new TestModule(
    "/TEST/", // ALL actions names will start with "/TEST/<action>".
    // `inc(1)` will produce {"type": "/TEST/INC", payload: 1}
    root => root.testModule // Base selector to get root state of module from application state
);

```
You can reuse modules classes, create instances with different prefixes,
rootSelectors and etc. And also you can use composition or any other OOP stuff
to reuse modules code and get more complex behavior

### Selectors and actions
```javascript
test("Selectors and actions", () => {
    expect(module.getX(state)).toBe(0);
    //...
    dispatch(module.inc(1));
    //...
    expect(module.getX(state)).toBe(1);
});
```
### Combining of modules
```javascript
import DuckModule, {combineModules} from "simple-duck"

test("Combine modules", () => {
    let duckModule = new TestModule("/TEST/", root => root.testModule);

    // Regular reducer function, not module
    let reducer = function (state, action) {
        switch (action.type) {
            case "DEC":
                return {y: state.y - 1};
        }
        return state;
    };
    let combined = combineModules({testModule: duckModule, regularModule: reducer});

    // apply actions to state using combined reducer
    let newState = combined(TEST_STATE, {type: "DEC"});
    newState = combined(newState, duckModule.inc());

    expect(newState.regularModule.y).toBe(-1);
    expect(duckModule.getX(newState)).toBe(1);
});
```
You can combine modules and regular redux reducer functions using `combineModules` function. It's work like
`combineReducers` but take both duck-modules and regular reducer functions.

### OOP usage
```javascript
export default class BaseFetchModule extends DuckModule {
    
    constructor(prefix, rootSelector, url, ajaxActionBuilder, cache = true) {
            super(prefix, rootSelector, ajaxActionBuilder);
            this.url = url;
            this.cache = cache;
            this.fetchAction = this.ajaxActionBuilder.makeFetchAction(this.FETCH, this.url, this.fetchOptions);
        }
    
    reduce(state = DEFAULT_STATE, action) {
        if (action.type !== this.FETCH) {
            return state;
        }
        if (!action.status) {
            return {...state, pending: true}
        }
        if (action.status === ActionStatus.SUCCESS) {
            return {...state, value: action.payload, pending: false, error: undefined}
        }
        if (action.status === ActionStatus.ERROR) {
            return {...state, value: undefined, pending: false,
                error: {message: action.error, code: action.errorCode, caught: action.caught}}
        }
    }
    
    /**
     * Get stored value
     * @param {object} state current application state
     * @return {*} stored value
     */
    getValue(state) {
        return this.getRoot(state).value;
    }
    
    getError(state) {
        return this.getRoot(state).error;
    }
    
    isPending(state) {
        return this.getRoot(state).pending;
    }
    
     fetch() {
        return (dispatch, getState) => {
            let state = getState();
            if (this.getValue(state) !== undefined && this.cache) {
                return Promise.resolve();
            }
            return dispatch(this.fetchAction);
        }
    }
}

export class X10fetchModule extends BaseFetchModule {
    getValue(state){
        return super.getValue(state) * 10;
    }
}

//API a module
const moduleA = new BaseFetchModule("/API/A/", root => root.a, "http://api.com/a");

const action1 = (dispatch, getState) => Promise.resolve()
    .then(() => dispatch(moduleA.fetch()))
    .then(() => dispatch(someUiModule.setAValue(moduleA.getValue(getState()))));


//Using same class to use other api endpoint
const moduleB = new BaseFetchModule("/API/B/", root => root.b, "http://api.com/b");

const action2 = (dispatch, getState) => Promise.resolve()
    .then(() => dispatch(moduleB.fetch()))
    .then(() => dispatch(someUiModule.setBValue(moduleB.getValue(getState()))));

// Using class with method override
const moduleC = new X10fetchModule("/API/C/", root => root.b, "http://api.com/b");
const action3 = (dispatch, getState) => Promise.resolve()
    .then(() => dispatch(moduleC.fetch()))
    .then(() => dispatch(someUiModule.setBValue(moduleC.getValue(getState()))));

```

### SlashNamedModule
You can create slash-named module with following naming conventions:

- module path (prefix) looks like `/FIRST_LEVEL_/MODULE/SECOND_LEVEL_MODULE/...etc`
- module prefix always strats and ends with `/` symbol

So we can "automagical" generate root selectors based on module name: For example: for prefix '/MODULE_A/SUBMODULE_B' 
selector will be 
```javascript
root => root.moduleA.submoduleB
```
 https://lodash.com/docs/#camelCase is used to convert module prefix parts to camelCase.
 Or you can provide second argument of parent constructor to uses your root selector function as in general `DuckModule` 
 class 

```javascript
import {SlashNamedModule} from "simple-duck"
/**
 * Test example of duck module
 */
class TestModule extends SlashNamedModule {
    constructor(prefix) {
        super(prefix);
        this.INC = this.action("INC")
    }
    inc(x = 0) {
        return {type: this.INC, payload: x}
    }
    getX(state) {
        return this.getRoot(state).x;
    }
    reduce(state = {x: 0}, action) {
        switch (action.type) {
            case this.INC:
                return {x: state.x + action.payload};
        }
        return super.reduce(state, action);
    }
}
//module name will be changed '/PARENT_MODULE/TEST_MODULE/' by constructor. It will add first and last symbol '/' if 
// needed 
let module = new TestModule("PARENT_MODULE/TEST_MODULE");
test("Selectors and actions", () => {
    expect(module.getX(TEST_STATE)).toBe(0);
    expect(module.prefix).toBe("/PARENT_MODULE/TEST_MODULE");
    let newState = {
        ...TEST_STATE,
        parentModule:{
            ...TEST_STATE.parentModule,
            testModule: module.reduce(module.getRoot(TEST_STATE), module.inc(1))
        }
    };
    expect(module.getX(newState)).toBe(1);
});

```