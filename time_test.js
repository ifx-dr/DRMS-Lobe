date = 'Wed Mar 08 2023 14:02:39 GMT+0000 (Coordinated Universal Time)'
// date_part = date.split(' ')
// console.log(date_part.length)
// console.log(new Date(Date.UTC(2023,3,22,11,34)))
nDate = new Date(date).toLocaleString('de-DE', { timeZone: 'CET' }) + ' (CET)'
console.log(nDate)