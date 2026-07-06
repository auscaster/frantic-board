/**
 * RunX Skill: Support Firewatch
 * 
 * This skill provides support for firewatch duties.
 * It can log observations, submit reports, and alert authorities.
 */

class SupportFirewatch {
  constructor() {
    this.name = 'support-firewatch';
    this.description = 'Support firewatch operations';
    this.observations = [];
  }

  /**
   * Initialize skill with runx context.
   * @param {object} context - The runx bot context.
   */
  init(context) {
    this.context = context;
    console.log(`[${this.name}] Initialized`);
  }

  /**
   * Log a firewatch observation.
   * @param {string} location - Location of observation.
   * @param {string} description - Description of what was observed.
   * @param {string} severity - Severity level (low, medium, high).
   * @returns {object} - The recorded observation.
   */
  logObservation(location, description, severity = 'low') {
    const observation = {
      id: this.observations.length + 1,
      timestamp: new Date().toISOString(),
      location,
      description,
      severity
    };
    this.observations.push(observation);
    console.log(`[${this.name}] Observation logged:`, observation);
    return observation;
  }

  /**
   * Submit a firewatch report.
   * @param {string} summary - Summary of observations.
   * @returns {string} - Report confirmation.
   */
  submitReport(summary) {
    const report = {
      timestamp: new Date().toISOString(),
      summary,
      observations: this.observations
    };
    console.log(`[${this.name}] Report submitted:`, report);
    // In production, this would send the report to a server or API.
    return `Report submitted successfully. Total observations: ${this.observations.length}`;
  }

  /**
   * Alert authorities about a critical situation.
   * @param {string} message - Alert message.
   */
  alertAuthorities(message) {
    console.log(`[${this.name}] ALERT: ${message}`);
    // In production, this would send an alert (SMS, email, etc.).
    return 'Authorities alerted.';
  }

  /**
   * Get all logged observations.
   * @returns {Array} - List of observations.
   */
  getObservations() {
    return this.observations;
  }

  /**
   * Clear all observations.
   */
  clearObservations() {
    this.observations = [];
    console.log(`[${this.name}] Observations cleared`);
  }
}

module.exports = SupportFirewatch;
