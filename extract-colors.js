const COLOR_REGEX = /(( |:|'|"|`)+)((#[A-Fa-f0-9]{2,8})|((rgb|RGB)(a|A)?\(( *(\d|\.)+ *,?){3,4}\))|(hsl|HSL)(a|A)?\(( *(\d|\.)+%? *,*){3,4}\))( |;|,|'|"|`)+/g;

function extractColors(text) {
  let match;
  let matches = [];

  while ((match = COLOR_REGEX.exec(text))) {
    matches.push({
      index: match.index + match[1].length,
      value: match[3]
    });
  }

  return matches;
}

export { extractColors };