// let a = Date()
// let b = 'Wed Mar 01 2023 16:01:39 GMT+0000 (Coordinated Universal Time)'
// startTime = new Date(b);
// endTime = new Date(a);
// // let currentT = new Date().getTime();
// console.log((endTime.getTime()-startTime.getTime())/1000/60)
date = '21.03.2023'
date_part = date.split('.')
a = (new Date(date_part[2], date_part[1]-1, date_part[0])).toString()
console.log(a)