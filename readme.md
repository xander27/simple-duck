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
        return super.reduce(state);
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
class IncAndDecModule extends TestModule {

    constructor(prefix, rootSelector) {
        super(prefix, rootSelector);
        this.DEC = this.prefix + "DEC"
    }


    reduce(state = {x: 0}, action) {
        switch (action.type) {
            case this.DEC:
                return {x: state.x - action.payload};
        }
        // Notice usage of super.reduce to make parent class actions working 
        return super.reduce(state);  
    }
    
    /**
     * Create new action of this.DEC type
     */
    dec(x) {
        return {type: this.DEC, payload: x}
    }
}

let module = new IncAndDecModule()

// And now use methods of child class
test("Selectors and actions", () => {
    expect(module.getX(state)).toBe(0);
    //...
    dispatch(module.inc(1));
    //...
    expect(module.getX(state)).toBe(1);
    //..
    dispatch(module.dec(3));
    //...
    expect(module.getX(state)).toBe(-2);
});
```
