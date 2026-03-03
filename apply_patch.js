const { readFileSync, writeFileSync } = require('fs');

const pathStr = 'components/Timetable/ProcessSlotCard.tsx';
let data = readFileSync(pathStr, 'utf8');

// The error occurred around line 431, "const teacherSvg..." because of r=4 instead of r="4".
// Also return statements around line 535 were duplicated because of block mis-parsing.
// I will just use string replace. Since it fails when there are duplicates, I will let Babel parse it if I could.
// But we'll try something safer:

const searchStr1 = `const teacherSvg = <svg width="10" height="10" viewBox="0 0 24 24" fill="none" class="w-3 h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r=4></circle></svg>;`;
const repStr1 = `const teacherSvg = <svg width="10" height="10" viewBox="0 0 24 24" fill="none" class="w-4 h-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;`;

const searchStr2 = `const teacherSvg = <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r=4></circle></svg>;`;
const repStr2 = `const teacherSvg = <svg width="10" height="10" viewBox="0 0 24 24" fill="none" class="w-4 h-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;`;

if (data.includes(searchStr1)) {
     data = data.split(searchStr1).join(repStr1);
     console.log('Fixed searchStr1');
} else if (data.includes(searchStr2)) {
     data = data.split(searchStr2).join(repStr2);
     console.log('Fixed searchStr2');
} else {
     console.log('Target string r=4 not found??');
}

writeFileSync(pathStr, data);
