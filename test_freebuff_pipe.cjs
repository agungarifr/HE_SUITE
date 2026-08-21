const { spawn } = require('child_process');

const child = spawn('freebuff', [], {
  stdio: ['pipe', 'pipe', 'pipe']
});

child.stdout.on('data', (data) => {
  console.log(`STDOUT: ${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`STDERR: ${data}`);
});

child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

setTimeout(() => {
  child.stdin.write('login\n');
}, 1000);

setTimeout(() => {
  child.kill();
}, 3000);
