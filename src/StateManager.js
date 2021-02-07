const { sleep } = require("stuffs");

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
    this.start();
  }

  #running = false;

  start() {
    if (this.#running) return;
    this.#running = true;
    this._tick();
  }

  async stop() {
    if (!this.#running) return;
    this.#running = false;
    await sleep(100);
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
  }

  _tick() {
    const states = Array.from(this.states.entries());
    if (states.length != 0) {
      this.stater(states);
    }
    if (this.#running) setTimeout(() => {
      this._tick();
    }, this.tickTime)
  }

}

module.exports = { StateManager };