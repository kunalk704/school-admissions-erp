const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf-8');

content = content.replace(/className=\"([^\"]*)\"/g, (match, classString) => {
  let classes = classString.split(' ').filter(c => c.trim() !== '');

  // Fix Page Titles: text-3xl font-bold -> text-2xl font-bold tracking-tight text-slate-900
  if (classes.includes('text-3xl')) {
    classes = classes.filter(c => c !== 'text-3xl' && c !== 'text-slate-800');
    classes.push('text-2xl', 'tracking-tight', 'text-slate-900');
  }

  // Fix Section Headings: text-xl font-semibold -> text-lg font-semibold tracking-tight text-slate-900
  if (classes.includes('text-xl') && classes.includes('font-semibold')) {
    classes = classes.filter(c => c !== 'text-xl' && c !== 'text-slate-800');
    classes.push('text-lg', 'tracking-tight', 'text-slate-900');
  }

  // Downsize card titles: text-lg font-semibold -> text-base font-semibold tracking-tight text-slate-900
  if (classes.includes('text-lg') && classes.includes('font-semibold') && !classes.includes('tracking-tight')) {
    classes = classes.filter(c => c !== 'text-lg' && c !== 'text-slate-800');
    classes.push('text-[17px]', 'tracking-tight', 'text-slate-900');
  }

  // Restore tracking-tight for any remaining text-2xl
  if (classes.includes('text-2xl') && !classes.includes('tracking-tight')) {
    classes.push('tracking-tight');
  }

  // Reduce some excessive spacing that might feel "too big"
  // space-y-6 -> space-y-5
  if (classes.includes('space-y-6')) {
    classes = classes.filter(c => c !== 'space-y-6');
    classes.push('space-y-5');
  }

  classes = [...new Set(classes)];
  return 'className=\"' + classes.join(' ') + '\"';
});

fs.writeFileSync('src/App.jsx', content);
console.log('Typography spacing and sizing refined.');
