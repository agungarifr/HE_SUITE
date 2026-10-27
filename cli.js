#!/usr/bin/env node
import { Command } from 'commander';
import { fork, exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('he-suite')
  .description('CLI for HE SUITE tools')
  .version('2.0.0');

program.command('ui')
  .description('Start the UI Dashboard and API Server')
  .action(() => {
    console.log('Starting HE SUITE Dashboard...');
    fork(path.join(__dirname, 'api.js'));
    
    setTimeout(() => {
      let openCommand;
      if (process.platform === 'darwin') openCommand = 'open';
      else if (process.platform === 'win32') openCommand = 'start';
      else openCommand = 'xdg-open';
      
      exec(`${openCommand} http://localhost:8888`);
    }, 1000);
  });

program.command('HE <url>')
  .description('Run Heuristic Evaluation (crawler + optional login) on a URL')
  .option('-i, --id <id>', 'Login ID / Email')
  .option('-p, --pass <password>', 'Login Password')
  .action((url, options) => {
    console.log(`Starting HE Evaluation for ${url}...`);
    const args = [url];
    if (options.id) args.push(options.id);
    if (options.id && !options.pass) args.push("");
    if (!options.id && options.pass) { args.push(""); args.push(options.pass); }
    else if (options.pass) args.push(options.pass);
    
    fork(path.join(__dirname, 'crawler.js'), args);
  });

program.parse();
