class LaunchGuard {
  constructor(config = {}) {
    this.config = {
      cooldown: config.cooldown || 3000,
      duration: config.duration || 5000,
      maxDefense: config.maxDefense || 100,
      ...config
    };
    this.active = false;
    this.remainingDefense = 0;
    this.timer = null;
  }

  activate() {
    if (this.active) {
      console.warn('LaunchGuard: Guard is already active.');
      return;
    }
    this.active = true;
    this.remainingDefense = this.config.maxDefense;
    console.log('LaunchGuard: Guard launched!');
    setTimeout(() => this.deactivate(), this.config.duration);
  }

  deactivate() {
    if (!this.active) return;
    this.active = false;
    this.remainingDefense = 0;
    console.log('LaunchGuard: Guard deactivated.');
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.startCooldown();
  }

  startCooldown() {
    this.timer = setTimeout(() => {
      console.log('LaunchGuard: Ready to launch again.');
    }, this.config.cooldown);
  }

  absorbDamage(amount) {
    if (!this.active) return amount;
    const absorbed = Math.min(amount, this.remainingDefense);
    this.remainingDefense -= absorbed;
    console.log(`LaunchGuard: Absorbed ${absorbed} damage. Remaining defense: ${this.remainingDefense}`);
    if (this.remainingDefense <= 0) {
      this.deactivate();
      return amount - absorbed; // overflow
    }
    return 0;
  }

  getStatus() {
    return {
      active: this.active,
      remainingDefense: this.remainingDefense,
      onCooldown: this.timer !== null
    };
  }
}

function launchGuard(config) {
  const guard = new LaunchGuard(config);
  guard.activate();
  return guard;
}

module.exports = { LaunchGuard, launchGuard };
