#!/usr/bin/env node
import { Command } from 'commander';
import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('he-suite')
  .description('CLI for HE SUITE tools')
  .version('1.0.0');

program.command('serve')
  .description('Start the Knowledge Base CMS API')
  .action(() => {
    console.log('Starting API server...');
    fork(path.join(__dirname, 'api.js'));
  });

program.command('mcp')
  .description('Start the MCP server')
  .action(() => {
    console.log('Starting MCP server...');
    fork(path.join(__dirname, 'mcp_server.js'));
  });

program.command('HE <url>')
  .description('Run Heuristic Evaluation (crawler + optional login) on a URL')
  .option('-i, --id <id>', 'Login ID / Email')
  .option('-p, --pass <password>', 'Login Password')
  .action((url, options) => {
    console.log(`Starting HE Evaluation for ${url}...`);
    const args = [url];
    if (options.id) args.push(options.id);
    // If pass is provided without id, or id without pass, args array might mismatch 
    // depending on how crawler.js reads argv[3] and argv[4]. 
    // Best to push undefined or empty string if one is missing, but to keep it simple:
    if (options.id && !options.pass) args.push("");
    if (!options.id && options.pass) { args.push(""); args.push(options.pass); }
    else if (options.pass) args.push(options.pass);
    
    fork(path.join(__dirname, 'crawler.js'), args);
  });

program.parse();
