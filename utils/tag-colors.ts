const tagColors: { [key: string]: string } = {};
const colors = [
  'rose',
  'pink',
  'fuchsia',
  'purple',
  'violet',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'emerald',
  'green',
  'lime',
  'yellow',
  'amber',
  'orange',
  'red'
];

export function getTagColor(tag: string): string {
  if (!tagColors[tag]) {
    const colorIndex = Object.keys(tagColors).length % colors.length;
    tagColors[tag] = colors[colorIndex];
  }
  return tagColors[tag];
}

