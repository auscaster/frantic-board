# RunX Skill: Support Firewatch

This skill provides firewatch support for runx. It allows logging observations, submitting reports, and alerting authorities.

## Usage

```javascript
const SupportFirewatch = require('./index.js');
const firewatch = new SupportFirewatch();
firewatch.init({});
firewatch.logObservation('Station 5', 'Unusual smoke detected', 'high');
firewatch.submitReport('Daily firewatch summary');
firewatch.alertAuthorities('Fire reported near perimeter!');
```

## API

- `logObservation(location, description, severity)` - Log a firewatch observation.
- `submitReport(summary)` - Submit a report with all logged observations.
- `alertAuthorities(message)` - Send an alert to authorities.
- `getObservations()` - Get list of observations.
- `clearObservations()` - Clear all observations.

## License
MIT
