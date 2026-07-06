// runx skill: meeting followup
// Generates a follow-up summary from meeting notes

/**
 * @param {Object} params
 * @param {string} params.title - Meeting title
 * @param {string} params.date - Meeting date
 * @param {string[]} params.attendees - List of attendees
 * @param {string[]} params.topics - List of topics discussed
 * @param {Object[]} params.actionItems - Array of action items { assignee, task, due }
 * @returns {Object} followUp - Structured follow-up message
 */
export async function meetingFollowup(params) {
  const { title, date, attendees, topics, actionItems } = params;

  let actionItemsSection = '';
  if (actionItems && actionItems.length > 0) {
    actionItemsSection = '\n## Action Items\n';
    actionItems.forEach((item, idx) => {
      const due = item.due ? ` (Due: ${item.due})` : '';
      actionItemsSection += `- [ ] ${item.assignee}: ${item.task}${due}\n`;
    });
  }

  const summary = `# Meeting Follow-up: ${title}\n\n**Date:** ${date || 'N/A'}\n**Attendees:** ${attendees ? attendees.join(', ') : 'N/A'}\n\n## Topics Discussed\n${topics ? topics.map(t => `- ${t}`).join('\n') : 'N/A'}\n${actionItemsSection}`;

  return {
    raw: summary,
    formatted: summary,
    type: 'markdown'
  };
}

// Default export for runx skill
const skill = {
  name: 'meeting-followup',
  description: 'Generates a follow-up summary from meeting notes',
  handler: meetingFollowup
};

export default skill;
