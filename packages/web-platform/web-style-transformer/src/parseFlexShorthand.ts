export function parseFlexShorthand(flexValue: string) {
  let flexGrow = '0';
  let flexShrink = '1';
  let flexBasis = 'auto';

  const parts = flexValue.split(' ').filter(e => e.trim());

  if (parts.length === 1) {
    if (parseFloat(parts[0]!).toString() === parts[0]) {
      flexGrow = parts[0];
      flexBasis = '0%';
    } else if (parts[0] === 'auto') {
      flexBasis = 'auto';
    } else if (parts[0] === 'none') {
    } else {
      flexBasis = parts[0]!;
    }
  } else if (parts.length === 2) {
    flexGrow = parts[0]!;
    // check it is numeric
    if (parseFloat(parts[1]!).toString() === parts[1]) {
      flexShrink = parts[1];
      flexBasis = '0%';
    } else {
      flexShrink = '1';
      flexBasis = parts[1]!;
    }
  } else if (parts.length === 3) {
    flexGrow = parts[0]!;
    flexShrink = parts[1]!;
    flexBasis = parts[2]!;
  }

  return {
    flexGrow,
    flexShrink,
    flexBasis,
  };
}
