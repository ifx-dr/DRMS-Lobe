let a = Date()
let b = 'Wed Mar 01 2023 23:01:39 GMT+0000 (Coordinated Universal Time)'
startTime = new Date(b);
endTime = new Date(b);
console.log(endTime.getHours())
let mm = endTime.getMinutes()
if(mm<10)
    mm = '0' + mm
console.log(mm)
// let currentT = new Date().getTime();
// console.log((endTime.getTime()-startTime.getTime())/1000/60)

// let a = ['[L1]a','[L2]b']
// let b = JSON.stringify(a)
// console.log(b)
// console.log(JSON.parse(b)[0])
