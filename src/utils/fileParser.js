/**
 * fileParser.js
 * Parses CSV and Excel files into raw row arrays.
 */
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class ParseError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ParseError'
  }
}

/**
 * Parse a File object (CSV or XLSX) into an array of row objects.
 * @param {File} file
 * @returns {Promise<Record<string, unknown>[]>}
 */
export async function parse(file) {
  if (!file) {
    throw new ValidationError('No file provided.')
  }

  const ext = file.name.split('.').pop()?.toLowerCase()

  if (!['csv', 'xlsx', 'xls'].includes(ext)) {
    throw new ValidationError('Accepted formats: .csv and .xlsx')
  }

  if (file.size === 0) {
    throw new ValidationError('File is empty. Please upload a valid file.')
  }

  if (ext === 'csv') {
    return parseCsv(file)
  } else {
    return parseExcel(file)
  }
}

function parseCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0 && results.data.length === 0) {
          reject(new ParseError('Unable to parse file. Please check the format.'))
          return
        }
        if (!results.data || results.data.length === 0) {
          reject(new ValidationError('File is empty. Please upload a valid file.'))
          return
        }
        resolve(results.data)
      },
      error: (error) => {
        reject(new ParseError(`Unable to parse file: ${error.message}`))
      },
    })
  })
}

async function parseExcel(file) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      throw new ValidationError('File is empty. Please upload a valid file.')
    }
    const worksheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: null })
    if (!rows || rows.length === 0) {
      throw new ValidationError('File is empty. Please upload a valid file.')
    }
    return rows
  } catch (err) {
    if (err instanceof ValidationError) throw err
    throw new ParseError('Unable to parse file. Please check the format.')
  }
}

export default { parse }
