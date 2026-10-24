const codePattern = /\b[PCBU][0-3][0-9A-F]{3}\b/gi;

const knownCodes = {
  P0101: 'Mass or volume air flow sensor range/performance',
  P0113: 'Intake air temperature sensor circuit high input',
  P0128: 'Coolant thermostat temperature below regulating temperature',
  P0133: 'Oxygen sensor circuit slow response',
  P0171: 'System too lean, bank 1',
  P0172: 'System too rich, bank 1',
  P0300: 'Random or multiple cylinder misfire detected',
  P0301: 'Cylinder 1 misfire detected',
  P0302: 'Cylinder 2 misfire detected',
  P0303: 'Cylinder 3 misfire detected',
  P0304: 'Cylinder 4 misfire detected',
  P0420: 'Catalyst system efficiency below threshold, bank 1',
  P0442: 'Evaporative emission system leak detected (small leak)',
  P0455: 'Evaporative emission system leak detected (large leak)',
  P0500: 'Vehicle speed sensor malfunction',
  P0700: 'Transmission control system requested warning indicator',
};

export function extractDtcCodes(text) {
  return [...new Set((text || '').match(codePattern) || [])].map((code) => code.toUpperCase());
}

export function reviewDtcCodes(codes) {
  return codes.map((code) => ({
    code,
    description: knownCodes[code] || 'Code detected. Consult the vehicle-specific service information for its definition.',
  }));
}

async function loadPdfJs() {
  if (typeof window === 'undefined') {
    return null;
  }

  const pdfModule = await import('pdfjs-dist/legacy/build/pdf');
  return pdfModule.default || pdfModule;
}

async function readPdfText(file) {
  const pdfjsLib = await loadPdfJs();
  if (!pdfjsLib) {
    throw new Error('PDF scan review is only available in the browser.');
  }

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data, disableWorker: true }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ');
    pages.push(pageText);
  }

  const combinedText = pages.join('\n');
  if (!combinedText.trim()) {
    throw new Error('No readable text was found in this PDF. Try a text-based scan export or upload a TXT, CSV, or JSON file.');
  }

  return combinedText;
}

export async function scanOBDFile(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  let text;

  if (extension === 'pdf' || file.type === 'application/pdf') {
    text = await readPdfText(file);
  } else if (['txt', 'csv', 'json'].includes(extension)) {
    text = await file.text();
  } else {
    throw new Error('Choose an OBD scan file in TXT, CSV, JSON, or PDF format.');
  }

  const codes = extractDtcCodes(text);
  if (!codes.length) {
    throw new Error('No OBD diagnostic codes were found in this file.');
  }

  return {
    fileName: file.name,
    codes: reviewDtcCodes(codes),
  };
}
