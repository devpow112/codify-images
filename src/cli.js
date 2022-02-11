#!/usr/bin/env node

import { program } from 'commander';
import { setUpProgram } from './coa.js';

setUpProgram(program);

program
  .parseAsync(process.argv)
  .catch(() => process.exit(1));
