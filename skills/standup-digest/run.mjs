const workEventsRaw = process.env.RUNX_INPUT_WORK_EVENTS || "[]";
let events = [];
try {
  events = JSON.parse(workEventsRaw);
} catch (e) {
  process.stderr.write("Invalid JSON in work_events\n");
  process.exit(64);
}

const seenIds = new Set();
const dedupedEvents = [];

for (const evt of events) {
  if (!evt.id) continue;
  if (seenIds.has(evt.id)) continue;
  seenIds.add(evt.id);
  dedupedEvents.push(evt);
}

const shipped = [];
const blockers = [];
const risks = [];
const next_actions = [];
const source_map = {};

for (const evt of dedupedEvents) {
  const text = evt.text || "";
  const lowerText = text.toLowerCase();
  
  let mappedItem = "";

  if (evt.type === 'pr_merged' || lowerText.includes('shipped') || lowerText.includes('merged')) {
    mappedItem = text;
    shipped.push(mappedItem);
  } else if (lowerText.includes('block') || lowerText.includes('stuck')) {
    mappedItem = text;
    blockers.push(mappedItem);
  } else if (lowerText.includes('risk') || lowerText.includes('danger')) {
    mappedItem = text;
    risks.push(mappedItem);
  } else {
    mappedItem = text;
    next_actions.push(mappedItem);
  }

  source_map[mappedItem] = {
    event_id: evt.id,
    timestamp: evt.timestamp || null,
    link: evt.link || null
  };
}

const result = {
  shipped,
  blockers,
  risks,
  next_actions,
  source_map
};

process.stdout.write(JSON.stringify(result) + '\n');
