/**
 * runx skill: meeting followup
 * 
 * Generates a structured follow-up from meeting notes.
 * This module exports a function that parses meeting notes and returns
 * action items, decisions, and next steps.
 *
 * @module meeting-followup
 */

'use strict';

/**
 * Parses meeting notes text and extracts follow-up items.
 * @param {string} notes - Raw meeting notes text.
 * @returns {Object} followup - An object containing actionItems, decisions, and nextMeeting.
 * @throws {Error} If notes is not a string.
 */
function generateFollowUp(notes) {
  if (typeof notes !== 'string') {
    throw new Error('Meeting notes must be a string.');
  }

  const lines = notes.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const actionItems = [];
  const decisions = [];
  let nextMeeting = null;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.startsWith('action:') || lowerLine.startsWith('- [ ]')) {
      actionItems.push(line.replace(/^(action:\s*|\-\s*\[\s*\]\s*)/i, '').trim());
    } else if (lowerLine.startsWith('decision:') || lowerLine.startsWith('decide:')) {
      decisions.push(line.replace(/^(decision:\s*|decide:\s*)/i, '').trim());
    } else if (lowerLine.startsWith('next meeting:')) {
      nextMeeting = line.replace(/^next meeting:\s*/i, '').trim();
    }
  }

  return {
    actionItems,
    decisions,
    nextMeeting
  };
}

module.exports = {
  generateFollowUp
};
