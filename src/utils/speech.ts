const INDONESIAN_MATH_MAP: Record<string, string> = {
  'nol': '0', 'kosong': '0',
  'satu': '1', 'dua': '2', 'tiga': '3', 'empat': '4', 'lima': '5',
  'enam': '6', 'tujuh': '7', 'delapan': '8', 'sembilan': '9',
  'sepuluh': '10', 'sebelas': '11', 'duabelas': '12',
  'tambah': '+', 'ditambah': '+', 'plus': '+',
  'kurang': '-', 'dikurang': '-', 'minus': '-',
  'kali': '*', 'dikali': '*', 'x': '*',
  'bagi': '/', 'dibagi': '/',
  'koma': '.', 'titik': '.',
  'persen': '%',
  'sama dengan': '=', 'hasil': '=', 'samadengan': '='
};

export const parseSpeechToMath = (transcript: string): string => {
  let lowerText = transcript.toLowerCase().trim();
  
  // If the SpeechRecognition returned native numbers and symbols (e.g., "2 + 3")
  // Let's sanitize that first.
  let sanitized = lowerText.replace(/\s+/g, ' ');
  
  // Try mapping words to characters
  const words = sanitized.split(' ');
  let resultExpression = '';
  
  for (const word of words) {
    if (INDONESIAN_MATH_MAP[word]) {
      resultExpression += INDONESIAN_MATH_MAP[word];
    } else if (!isNaN(Number(word))) {
      // Direct numbers
      resultExpression += word;
    } else if (['+', '-', '*', '/', '.', '%', '='].includes(word)) {
      resultExpression += word;
    }
  }

  // If mapping failed to produce a clean mathematical string, fallback to a regex clean
  if (!resultExpression) {
    resultExpression = sanitized
      .replace(/x/gi, '*')
      .replace(/[^0-9\+\-\*\/\.\%\=]/g, ''); 
  }

  return resultExpression;
};
