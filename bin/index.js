#!/usr/bin/env node

'use strict'

import { writeFile } from 'fs'
import toCubic from '@cdoublev/to-cubic'

const args = process.argv.slice(2)

let input
let output = 'stdout'
let precision
let printHelp = false
while (args.length) {
    const arg = args.shift()
    if (arg === '-h' || arg === '--help') {
        printHelp = true
        break
    } else if (arg === '-r' || arg === '--round') {
        precision = args.shift()
    } else if (input) {
        output = arg
    } else {
        input = arg.startsWith('/') ? arg : `${process.cwd()}/${arg}`
        console.log(input, process.cwd())
    }
}

if (printHelp || !/\.(c|m)?js$/.test(input)) {
    console.log('\x1b[32m%s\x1b[0m', 'to-cubic\n')
    console.log(`Usage: to-cubic [-r|--round <precision>] <input.> [output-filepath]\n`)
} else {
    import(input)
        .then(({ default: definitions }) => {
            const result = toCubic(definitions, precision).join('\n')
            if (args.length < 2) {
                return console.log(result)
            }
            writeFile(args[1], result, error => {
                if (error) {
                    throw error
                }
            })
        })
        .catch(e => console.log(e))
}
