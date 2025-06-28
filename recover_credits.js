// Script to recover missing credits from failed webhook processing

const userId = 'bde707c9-68bd-4972-ba29-8a85a2a234cb';
const baseUrl = 'https://ai-hub-pro.vercel.app';

// Missing credits from failed payments
const missedPayments = [
  { sessionId: 'cs_test_b117btKoq6RGArXpJsCZTZHoUuk3COqutpPiRh7URMYavkIfEfFGKbzOTf', credits: 100, amount: '99.99 AED' },
  { sessionId: 'cs_test_b1pTkwQ7QV9Z12GNfU8MqqEDpfq1iWLA4R2hQHMB8SpubawWL2YaQHHTVM', credits: 50, amount: '49.99 AED' },
  { sessionId: 'cs_test_b1Fd7cRVh34nLZdILfGlU3aGWtXnrtU8SRRknI4Ngl2gU6dBJ7IYysQZeO', credits: 100, amount: '99.99 AED' },
  { sessionId: 'cs_test_b1NQGKapfvysFyo0xrxJjUh9z36MRRMzqzPRzwBiMkhK4S7Y3rsPGLbroz', credits: 100, amount: '99.99 AED' },
  { sessionId: 'cs_test_b1OoyfIE1E0pG8HE3d4yaJxKyGZMKzf8bvbARF52FNREf1XSeimoYYpa6D', credits: 100, amount: '99.99 AED' },
  { sessionId: 'cs_test_b1QAoL0cY0qgSfu1zHU1sI5gOWf89nVda2vAXvpa47JlZGSsPzrgahwNdW', credits: 100, amount: '99.99 AED' } // Most recent
];

const totalMissingCredits = missedPayments.reduce((sum, payment) => sum + payment.credits, 0);

console.log('🔍 Credit Recovery Analysis:');
console.log('User ID:', userId);
console.log('Total Failed Payments:', missedPayments.length);
console.log('Total Missing Credits:', totalMissingCredits);
console.log('');

console.log('📋 Failed Payments:');
missedPayments.forEach((payment, index) => {
  console.log(`${index + 1}. ${payment.amount} → ${payment.credits} credits (${payment.sessionId})`);
});

console.log('');
console.log('🚀 To recover these credits, run:');
console.log('');

// Generate curl commands for manual recovery
missedPayments.forEach((payment, index) => {
  const curlCommand = `curl -X POST "${baseUrl}/api/manual-credit" \\
  -H "Content-Type: application/json" \\
  -d '{"userId": "${userId}", "credits": ${payment.credits}, "reason": "Webhook failed for ${payment.sessionId}"}'`;
  
  console.log(`# Payment ${index + 1}: ${payment.amount}`);
  console.log(curlCommand);
  console.log('');
});

console.log('💡 Or add all missing credits at once:');
console.log(`curl -X POST "${baseUrl}/api/manual-credit" \\
  -H "Content-Type: application/json" \\
  -d '{"userId": "${userId}", "credits": ${totalMissingCredits}, "reason": "Bulk recovery for ${missedPayments.length} failed webhook payments"}'`);