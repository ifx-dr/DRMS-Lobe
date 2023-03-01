let a = Date()
let b = 'Wed Mar 01 2023 16:01:39 GMT+0000 (Coordinated Universal Time)'
startTime = new Date(b);
endTime = new Date(a);
// let currentT = new Date().getTime();
console.log((endTime.getTime()-startTime.getTime())/1000/60)