// Solution for issue #330
// Generated automatically by Baobot

// This script is a placeholder solution for the GitHub issue #330.
// It is designed to be executed as a Node.js module or script.

const frantictab = require('frantictab'); // Assuming a fictional FranticTab library

async function addStartupOffer() {
  try {
    const bounty = await frantictab.getFranticBounty('120');
    if (bounty) {
      const sourceyOffer = {
        title: 'Frantic Sourcey Startup Offer',
        description: 'Unlock exclusive access to our platform for the first month for new users.',
        value: 'Exclusive access for one month',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // One month from now
      };
      
      bounty.offers.push(sourceyOffer);
      
      await frantictab.updateFranticBounty('120', bounty);
      
      console.log('Startup offer added successfully.');
    } else {
      console.error('Frantic bounty #120 not found.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

addStartupOffer();


Please note that this script assumes the existence of a fictional FranticTab library for demonstration purposes. The actual implementation might require integration with a real GitHub API or similar service. Additionally, error handling is kept simple for brevity.