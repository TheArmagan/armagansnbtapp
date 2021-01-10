class StateManager {

  /** @type {(newStates: Array<Object>)=>any} */
  stater;

  /** @type {Object} */
  default;

  tickTime = 250;
  constructor(stater = () => { }, defaultValue = {}, tickTime = 250) {
    this.stater = stater;
    this.default = defaultValue;
    this.tickTime = tickTime;
    this.tick();
  }

  /** @type {Map<string, Object>} */
  states = new Map();

  get(name = "", firstReset = false) {
    if (!this.states.has(name) || firstReset) this.states.set(name, this.default);
    return this.states.get(name);
  }

  reset(name) {
    this.states.set(name, this.default);
  }

  tick() {
    const states = Array.from(this.states.entries());
    if (states.length != 0) {
      this.stater(states);
    }
    setTimeout(() => {
      this.tick();
    }, this.tickTime)
  }

}

module.exports = { StateManager };