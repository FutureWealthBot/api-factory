import assert from 'assert';

async function run() {
  const url = 'http://localhost:3000/api/v1/hello/ping';
  // no Authorization header
  const res = await fetch(url);
  const json = await res.json();
  // expect a 401-style error with message
  if (!json || !json.error) throw new Error('expected error response');
  console.log('PASS');
}

run().catch((err) => {
  console.error('TEST FAILED');
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
