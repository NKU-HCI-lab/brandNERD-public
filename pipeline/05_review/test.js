/**
 * Finds all common word intersections (contiguous n-grams) across an array of strings,
 * counts how many distinct input strings each appears in, and returns them sorted by:
 *   1. occurrences descending
 *   2. phrase length (number of words) descending
 *   3. alphabetically ascending
 *
 * @param {string[]} inputs - Array of input strings
 * @param {number} minCount - Minimum number of distinct inputs a phrase must appear in (default 2)
 * @returns {{ phrase: string, count: number }[]} Sorted list of phrases with their occurrence counts
 */
function findWordIntersections(inputs, minCount = 2) {
  const phraseMap = new Map();

  inputs.forEach((line, idx) => {
    const tokens = line.toLowerCase().split(/\s+/);
    const seen = new Set();

    // Generate all contiguous n-grams for this line
    for (let len = 1; len <= tokens.length; len++) {
      for (let start = 0; start + len <= tokens.length; start++) {
        const phrase = tokens.slice(start, start + len).join(' ');
        if (!seen.has(phrase)) {
          seen.add(phrase);
          if (!phraseMap.has(phrase)) {
            phraseMap.set(phrase, new Set());
          }
          phraseMap.get(phrase).add(idx);
        }
      }
    }
  });

  // Filter phrases by minimum distinct input count
  const results = [];
  for (const [phrase, idxSet] of phraseMap.entries()) {
    const count = idxSet.size;
    if (count >= minCount) {
      results.push({ phrase, count });
    }
  }

  // Sort by count desc, then phrase length desc, then alphabetically
  results.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    const lenDiff = b.phrase.split(' ').length - a.phrase.split(' ').length;
    if (lenDiff !== 0) return lenDiff;
    return a.phrase.localeCompare(b.phrase);
  });

  return results;
}

// Example usage:
const inputStrings = [
  "AMAZON.COM: 1ZERO",
  "1Zero Direct @ Amazon.com:",
  "Amazon.com: Car Electronics Accessories - 1Zero / Car Electronics Accessories / Vehicle Elec...: Electronics",
  "1Zero Review of 2024 - Cell Phone Automobile Cradles Brand - FindThisBest",
  "Amazon.com: 1Zero Magnetic Phone Car Mount with Quick Extension Telescopic Arm, Hands-Free Windshield Dashboard Cell Phone Holder for Car Compatible with iPhone Smartphone, Sticky Suction Cup, 6 Strong Magnets : Cell Phones & Accessories",
  "Amazon.com: 1Zero: CAR PHONE MOUNT",
  "Amazon.com",
  "Amazon.com: 1Zero: MAGSAFE CAR MOUNT",
  "Amazon.com: 1Zero Magnetic Phone Car Mount 14-Inch Gooseneck Long Arm Extension, Universal Windshield Dashboard Industrial-Strength Suction Cup Car Phone Holder with 6 Strong Magnets, for All Cell Phones iPhone : Cell Phones & Accessories",
  "Amazon.com: 1Zero Auto Clamping Wireless Car Charger Sturdy Cup Holder Phone Mount 15W Fast Charging Car Mount for iPhone 15 Pro Max Plus 14 13 12 11 XS X Samsung S24 Ultra S23 S22 S22 S21 S20 Pixel 8 Pro 7 6 5 4 : Cell Phones & Accessories",
  "Magnetic Phone Car Mount [14-Inch Gooseneck Long Arm Extension], 1Zero Universal Windshield Dashboard Industrial-Strength Suction Car Phone Holder with 6 Strong Magnets,Compatible for All Cell Phones : Amazon.ca: Electronics",
  "Home - Amazon Sustainability",
  "Amazon.com: 1Zero Adhesive GPS Mount with Pliable TPU Base [Upgrade], Stick On Dashboard Car Mounts for Garmin Nuvi Series GPS, Replacement Satnav Dash Holder : Electronics",
  "List of Amazon brands - Wikipedia",
  "Buy 1zero Products Online at Best Prices in India | Ubuy",
  "Amazon.in: ZeroB",
  "Zero Brands @ Amazon.com:",
  "Msdivatrucker"
]

const intersections = findWordIntersections(inputStrings);
intersections.forEach((item, i) => {
  console.log(`${i + 1}. '${item.phrase}' — ${item.count}`);
});
