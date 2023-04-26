// let a = Date()
// let b = 'Wed Mar 01 2023 16:01:39 GMT+0000 (Coordinated Universal Time)'
// startTime = new Date(b);
// endTime = new Date(a);
// // let currentT = new Date().getTime();
// console.log((endTime.getTime()-startTime.getTime())/1000/60)
// date = '21.03.2023'
// date_part = date.split('.')
// a = (new Date(date_part[2], date_part[1]-1, date_part[0])).toString()
// console.log(a)

const { stringify } = require("querystring")

// const nDate = new Date('Thu Mar 09 2023 10:02:02 GMT+0000 (Coordinated Universal Time)').toLocaleString('de-DE', { timeZone: 'CET' })
date = 'Thu Mar 09 2023 10:02:04 GMT+0000 (Coordinated Universal Time)'
// date_part = date.split(' ')
// console.log(date_part.length)
// console.log(new Date(Date.UTC(2023,3,22,11,34)))
nDate = new Date(date).toLocaleString('de-DE', { timeZone: 'CET' }) + ' (CET)'
console.log(nDate)
link = 'https://api.github.com/repos/tibonto/dr/commits/master'
fetch(link, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // "PRIVATE-TOKEN":this.state.Repo.AccessToken,
    },
  //   body: JSON.stringify(data)
  }).then(function(resp){
      console.log(resp.json());
      return resp.json();
  }).then((body)=>{
    console.log(JSON.stringify(body))
})