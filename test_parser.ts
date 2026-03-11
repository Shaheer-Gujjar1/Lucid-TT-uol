import { processDayData } from './lib/parser';

const dayData = [
  ['Room', '08:30-09:20', '09:20-10:10', '10:10-11:00', '11:00-11:50'],
  ['116', 'Normal Case\nRIT-2', 'Slashed Case\nDPT 2/HND 2/RIT 2', 'Ordinal Case\nBS RIT 2nd', 'Roman Case\nRITII'],
  ['121', 'Merged Case\nBS RIT 1st/BS MLT 1st', 'Hyphen Case\nRIT-II', 'Space Case\nRIT II', 'Clean Case\nRIT 2']
];

console.log('Testing RIT 2 Filter:');
const results = processDayData(dayData, 'student', { program: 'RIT', semester: '2', section: '', course: '' });
console.log(JSON.stringify(results, null, 2));

console.log('---');
console.log('Testing RIT 1 Filter:');
const results1 = processDayData(dayData, 'student', { program: 'RIT', semester: '1', section: '', course: '' });
console.log(JSON.stringify(results1, null, 2));

console.log('---');
console.log('Testing "Writing" word boundary check:');
const writingData = [['Room', '08:30-09:20'], ['101', 'Writing Class']];
const resultsWriting = processDayData(writingData, 'student', { program: 'RIT', semester: '1', section: '', course: '' });
console.log('Writing Match count (should be 0):', resultsWriting[0].entries.length);
