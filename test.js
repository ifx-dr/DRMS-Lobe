const { setTimeout: setTimeoutPromise } = require('node:timers/promises');

let ac = new AbortController();
let signal3 = ac.signal;
// let signal2 = ac.signal;
const MIN = 1000;
// setTimeout(()=>{
//   console.log('here0')
// },1000)
// setTimeoutPromise(1000, null, {signal})
//   .then(()=>{
//     // time out: end proposal/voting
//     console.log('here')
//     // setTimeoutPromise(1000, null)
//     // .then(()=>{
//     //   // time out: end proposal/voting
//     //   console.log('here2')
//     // })
//   })
//   .catch((err) => {
//     // lobe owner voted / all members voted, stop timer
//     if (err.name === 'AbortError'){
//       console.log(`app CreatedProposal: receive lobe owner voting signal, invoking EndProposal`)
//     //   // contract.submitTransaction('EndProposal', proposalID, lobeOwnerResult);
//     }	
//   });
  

// ac.abort(); 
// a = [1,2]
// b = [3,4]
// c = a.concat(b)
// console.log(a)
// let s = `You successfully create a proposal! ProposalID:proposal5`
// console.log(s.substring(s.indexOf('ProposalID:')+'ProposalID:'.length))

setTimeoutPromise(MIN, null,  signal3 )
.then(()=>{
  console.log(`INFO app createdProposal: no lobe owner voting in 1 min, expert voting available within 1 min`);
  // chaincode checks the time interval
  // start expert voting timer: 48 h
  // setTimeoutPromise(MIN, null, signal3 )
  // .then(()=>{
  //   // time out: proposal closed
  //   console.log(`INFO app createdProposal: expert voting expired`);
  //   // return contract.submitTransaction('ProposalVoteResult', proposalID, 'true');
  // })
  // .catch((err) => {
  //       // lobe owner voted / all members voted, stop timer
  //       if (err.name === 'AbortError'){
  //         console.log(`2`)
  //         // contract.submitTransaction('EndProposal', proposalID, lobeOwnerResult);
  //       }	
  //     });
})	
.catch((err)=>{
  if (err.name === 'AbortError'){
            // console.log(`app CreatedProposal: receive lobe owner voting signal, invoking EndProposal`)
    //         // contract.submitTransaction('EndProposal', proposalID, lobeOwnerResult);
          }	
});

ac.abort(); 