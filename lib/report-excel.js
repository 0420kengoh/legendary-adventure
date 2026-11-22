// lib/report-excel.js — build a real .xlsx from report data, in the browser.
//
// SheetJS is pulled from a CDN the first time an export is run, so nothing
// is added to package.json and the rest of the app loads no heavier.
//
// Numbers are written as NUMBERS, not text. That matters: a column of
// "RM 1,234.00" strings cannot be summed, sorted or pivoted, which defeats
// the point of exporting to Excel at all. Currency and dates get a display
// format instead, so they look right and still behave like values.

const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'

let loader = null
function loadXLSX() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Browser only'))
  if (window.XLSX) return Promise.resolve(window.XLSX)
  if (loader) return loader
  loader = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = CDN
    s.onload  = () => window.XLSX ? resolve(window.XLSX)
                                  : reject(new Error('Spreadsheet library did not load'))
    s.onerror = () => { loader = null; reject(new Error('Could not reach the spreadsheet library. Check the connection and try again.')) }
    document.head.appendChild(s)
  })
  return loader
}

const MONEY = '#,##0.00'
const PCT   = '0.00"%"'
const DATE  = 'dd/mm/yyyy'
const NUM1  = '0.0'

// Excel refuses sheet names over 31 characters or containing : \ / ? * [ ]
const safeName = n => String(n).replace(/[:\\/?*[\]]/g, '-').slice(0, 31) || 'Sheet'

function widthsFor(rows) {
  const w = []
  rows.forEach(r => (r || []).forEach((c, i) => {
    const len = c instanceof Date ? 10
      : c === null || c === undefined ? 0
      : String(typeof c === 'number' ? c.toFixed(2) : c).length
    if (!w[i] || len > w[i]) w[i] = len
  }))
  return w.map(n => ({ wch: Math.min(Math.max((n || 4) + 2, 8), 52) }))
}

/**
 * sheets: [{ name, rows, money?: [colIdx], pct?: [colIdx], date?: [colIdx], num1?: [colIdx] }]
 *         rows[0] is the header row.
 */
export async function downloadWorkbook(filename, sheets) {
  const XLSX = await loadXLSX()
  const wb = XLSX.utils.book_new()

  sheets.forEach(sheet => {
    const rows = sheet.rows || []
    const ws = XLSX.utils.aoa_to_sheet(rows, { cellDates: true })
    ws['!cols'] = widthsFor(rows)
    if (rows.length) ws['!autofilter'] = { ref: XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: Math.max(0, rows.length - 1), c: Math.max(0, (rows[0] || []).length - 1) },
    }) }

    const apply = (cols, fmt) => (cols || []).forEach(c => {
      for (let r = 1; r < rows.length; r++) {
        const ref = XLSX.utils.encode_cell({ r, c })
        const cell = ws[ref]
        if (cell && cell.t === 'n') cell.z = fmt
      }
    })
    apply(sheet.money, MONEY)
    apply(sheet.pct,   PCT)
    apply(sheet.num1,  NUM1)
    ;(sheet.date || []).forEach(c => {
      for (let r = 1; r < rows.length; r++) {
        const cell = ws[XLSX.utils.encode_cell({ r, c })]
        if (cell && cell.t === 'd') cell.z = DATE
      }
    })

    XLSX.utils.book_append_sheet(wb, ws, safeName(sheet.name))
  })

  XLSX.writeFile(wb, filename, { cellDates: true, compression: true })
}

export const stamp = () => {
  const d = new Date()
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export const asDate = v => {
  if (!v) return null
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d
}

export const round2 = n => Math.round((Number(n) || 0) * 100) / 100
