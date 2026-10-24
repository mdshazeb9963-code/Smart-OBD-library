import { extractDtcCodes, reviewDtcCodes } from './obdScan';

test('extracts unique OBD diagnostic codes from scan text', () => {
  expect(extractDtcCodes('DTC: P0301, P0301 and U0100')).toEqual(['P0301', 'U0100']);
});

test('reviews common codes and describes unknown codes conservatively', () => {
  expect(reviewDtcCodes(['P0301', 'P1234'])).toEqual([
    { code: 'P0301', description: 'Cylinder 1 misfire detected' },
    {
      code: 'P1234',
      description: 'Code detected. Consult the vehicle-specific service information for its definition.',
    },
  ]);
});
