#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'ledger.json');

function loadLedger() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading ledger:', err);
  }
  return [];
}

function saveLedger(ledger) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(ledger, null, 2), 'utf8');
}

function addEntry(amount, description) {
  const ledger = loadLedger();
  const entry = {
    id: ledger.length + 1,
    date: new Date().toISOString(),
    amount: amount,
    description: description
  };
  ledger.push(entry);
  saveLedger(ledger);
  console.log('Entry added:', entry);
}

function listEntries() {
  const ledger = loadLedger();
  if (ledger.length === 0) {
    console.log('No entries found.');
    return;
  }
  console.log('Ledger entries:');
  ledger.forEach(entry => {
    console.log(`#${entry.id}: ${entry.date} - $${entry.amount} - ${entry.description}`);
  });
}

function clearLedger() {
  saveLedger([]);
  console.log('Ledger cleared.');
}

function showHelp() {
  console.log(`
Usage: bookkeeper <command> [options]

Commands:
  add <amount> <description>   Add a new entry
  list                         List all entries
  clear                        Clear all entries
  help                         Show this help
`);
}

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'add':
    if (args.length < 3) {
      console.log('Usage: bookkeeper add <amount> <description>');
      process.exit(1);
    }
    const amount = parseFloat(args[1]);
    if (isNaN(amount)) {
      console.log('Amount must be a number.');
      process.exit(1);
    }
    const description = args.slice(2).join(' ');
    addEntry(amount, description);
    break;
  case 'list':
    listEntries();
    break;
  case 'clear':
    clearLedger();
    break;
  case 'help':
  default:
    showHelp();
    break;
}
