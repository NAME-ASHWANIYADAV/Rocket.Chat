process.env.TS_NODE_PROJECT = `${__dirname}/tsconfig.test.json`;
process.env.TS_NODE_TRANSPILE_ONLY = 'true';

require('ts-node/register');

require('./tests/SerializationFidelity.spec.ts');
require('./tests/RegistrationValidation.spec.ts');
require('./tests/RuntimeBehavior.spec.ts');
