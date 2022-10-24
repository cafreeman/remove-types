#!/usr/bin/env node
import { removeTypes } from './'
import { readFileSync, writeFileSync } from 'fs'

if (process.argv.length < 4) {
    console.log('Usage: remove-types src.ts dest.js')
    process.exit(2)
}

const src = readFileSync(process.argv[2], 'utf-8')
removeTypes(src).then(output => {
  writeFileSync(process.argv[3], output)
}).catch(e => console.log(e))
