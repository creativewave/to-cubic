#!/usr/bin/env node

'use strict'

import { writeFile } from 'fs'
import toCubic from '@cdoublev/to-cubic'

const args = process.argv.slice(2)

if (args.length < 1 || ['-h', '--help'].includes(args[0]) || !args[0].endsWith('.js')) {
    console.log('\x1b[32m%s\x1b[0m', 'to-cubic\n')
    console.log(`Usage: to-cubic <input-filepath> [output-filepath]\n`)
} else {
    import(`${process.cwd()}/${args[0]}`)
        .then(({ default: definitions }) => {
            const result = toCubic(definitions).join('\n')
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
