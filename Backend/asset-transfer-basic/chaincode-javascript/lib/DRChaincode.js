/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const BC = require('./blockchain/blockchain')

const crypto = require("crypto");
const collection = "Org1MSPPrivateCollection";
const algorithm = "aes-256-cbc"; 

class DRChaincode extends Contract {
    /*
    async CreatePrivateAsset(ctx){
        let collection = "Org1MSPPrivateCollection";
        let transientMap = ctx.stub.getTransient();
        console.log(JSON.stringify(transientMap));
        let transientData = transientMap['asset_properties'];
        let data_str = JSON.stringify(transientData);
        
        console.log(data_str);
        data_str = "hello";
        await ctx.stub.putPrivateData(collection, "privateData", Buffer.from(data_str));
        return 0;
    }
    async ReadPrivateAsset(ctx, collection, assetID){
        let result = await ctx.stub.getPrivateData(collection, assetID)
        return result;
    }
    async GenerateSymmetricKey(ctx){
        
        // generate 16 bytes of random data
        // const IV = crypto.randomBytes(16);
        // secret key generate 32 bytes of random data
        // const symmetricKey = crypto.randomBytes(32);
        // let cryptoMaterials = {
        //     symmetricKey: symmetricKey.toString('hex'),
        //     IV: IV.toString('hex')
        // };
        // fixed key, for test use
        let cryptoMaterials = {
            symmetricKey: 'b0d2aad9db0ce0b379600225538c5642a793da7888e0e2e7559c8c64455cc322',
            IV: '55fac4a1e8cdcd52456ba2f7d1b297db'
        };
        await ctx.stub.putPrivateData(collection, "cryptoMaterials", Buffer.from(JSON.stringify(cryptoMaterials)));
    }
    async GetSymmetricKey(ctx){
        let result = await ctx.stub.getPrivateData(collection, "cryptoMaterials");
        return result;
    }
    */
    // set initial value to variables
    // modified: read the initial state from yml file
    async InitLedgerFromFile(ctx, ledgerTXT){
        // let ledgerTXT = saver.readStatus();
        // console.log(ledgerTXT['UserInfo'][0]['LobeOwner'])
        ledgerTXT = JSON.parse(ledgerTXT)
        let members = ledgerTXT['UserInfo'];
        let ongoingProposals = ledgerTXT['OngoingProposalInfo'];
        console.log(ongoingProposals)
        let closedProposals = ledgerTXT['ClosedProposalInfo'];

        let membersInDomain = {
            "Planning": [],
            "Time":[],
            "Supply Chain":[],
            "Organisation":[],
            "Semiconductor Production":[],
            "Product":[],
            "Power":[],
            "Sensor":[],
            "Semi-conductor Development":[],
            "System":[],
            "Process":[],
            "Wired Communication":[],
            "Cloud":[],
        }
        let allLobeOwners = {
            "Planning": null,
            "Time":null,
            "Supply Chain":null,
            "Organisation":null,
            "Semiconductor Production":null,
            "Product":null,
            "Power":null,
            "Sensor":null,
            "Semi-conductor Development":null,
            "System":null,
            "Process":null,
            "Wired Communication":null,
            "Cloud":null,
        }
        
        for(let member of members){
            let date_part = member.LastParticipation.split('.');
            if(date_part.length==3){
                member.LastParticipation = (new Date(date_part[2], date_part[1]-1, date_part[0])).toString();
            }
            for(let domain of member["LobeOwner"]){
                console.log("Finding lobe owner: "+domain)
                if(domain==null)
                    break;
                if(membersInDomain[domain]==null)
                    membersInDomain[domain] = [];
                membersInDomain[domain].push(member.ID);
                allLobeOwners[domain] = member.ID;
            }
            for(let domain of member["Expert"]){
                console.log("Finding expert: "+domain)
                if(domain==null)
                    break;
                if(membersInDomain[domain]==null)
                    membersInDomain[domain] = [];
                membersInDomain[domain].push(member.ID);
            }
        }
        await ctx.stub.putState('members', Buffer.from(JSON.stringify(members)));
        await ctx.stub.putState('membersInDomain', Buffer.from(JSON.stringify(membersInDomain)));
        // domainLobeOwners.docType = 'domains';
        await ctx.stub.putState('allLobeOwners', Buffer.from(JSON.stringify(allLobeOwners)));
        
        let ongoingProposalQueue = [];
        let closedProposalQueue = [];
        if(ongoingProposals!=null){
            for(let ongoingProposal of ongoingProposals){
                let date_part = ongoingProposal.Creation_Date.split('.');
                if(date_part.length==3){
                    ongoingProposal.Creation_Date = (new Date(date_part[2], date_part[1]-1, date_part[0])).toString();
                }
                // ongoingProposal.docType = 'proposal';
                ongoingProposalQueue.push(ongoingProposal.ID);
                await ctx.stub.putState(ongoingProposal.ID, Buffer.from(JSON.stringify(ongoingProposal)));
                // let indexName = 'proposal-order';
                // let ProposalOrderKey = ctx.stub.createCompositeKey(indexName, [proposal.Valid, proposal.ID]);
                // await ctx.stub.putState(ProposalOrderKey, null);
                console.info(`Proposal ${ongoingProposal.ID} initialized`);
            }
        }
        else
            console.log("cc: ongoingProposalQueue is null")
        await ctx.stub.putState("ongoingProposalQueue", Buffer.from(JSON.stringify(ongoingProposalQueue)));

        if(closedProposals!=null){
            for(let closedProposal of closedProposals){
                let date_part = closedProposal.EndDate.split('.');
                if(date_part.length==3){
                    closedProposal.EndDate = (new Date(date_part[2], date_part[1]-1, date_part[0])).toString();
                }
                // closedProposal.docType = 'closedProposal';
                await ctx.stub.putState(closedProposal.ID, Buffer.from(JSON.stringify(closedProposal)));
                console.info(`ClosedProposal ${closedProposal.ID} initialized`);
                closedProposalQueue.push(closedProposal);
            }
        }
        await ctx.stub.putState("closedProposalQueue", Buffer.from(JSON.stringify(closedProposalQueue)));

        console.info(`Member ${allLobeOwners} initialized`);
        const total_members = members.length ;
        await ctx.stub.putState('total_members', Buffer.from(JSON.stringify(total_members)));
        const total_proposals = ongoingProposalQueue.length + closedProposalQueue.length;
        console.log('cc total proposals: '+total_proposals);
        await ctx.stub.putState('total_proposals', Buffer.from(JSON.stringify(total_proposals)));

        // const ongoingProposal = 4;
        if(ongoingProposalQueue.length!=0){
            const ongoingProposal = ongoingProposalQueue[0];
            await ctx.stub.putState('ongoingProposal', Buffer.from(JSON.stringify(ongoingProposal)));
        }
        else
            await ctx.stub.putState('ongoingProposal', Buffer.from(JSON.stringify('none')));
        

        // const latestDR = 'http://localhost:3006/v0';
        const latestDR = 'https://github.com/tibonto/dr/commit/50d0834deba2ce791772be7932055cf1a7bb9545'
        await ctx.stub.putState('latestDR', Buffer.from(JSON.stringify(latestDR)));
        // download link of the ongoing proposal
        // const fileHash = 'https://ipfs.io/ipfs/QmSWDa85q8FQzB8qAnuoxZ4LDoXoWKmD6t4sPszdq5FiW2?filename=test.owl';
        const fileHash = 'https://github.com/tibonto/dr/archive/50d0834deba2ce791772be7932055cf1a7bb9545.zip'
        await ctx.stub.putState('fileHash', Buffer.from(JSON.stringify(fileHash)));

        ////////////////////
        // voted voters
        var voted = [];
        await ctx.stub.putState('voted', Buffer.from(JSON.stringify(voted)));
        
        console.log('*******************DRChaincode: File recovered*******************');
    }
    async InitBlockchainFromFile(ctx, blockchain){
        console.log('cc: retrieve blockchain from file');
        blockchain = JSON.parse(blockchain);
        await ctx.stub.putState('blockchain', Buffer.from(JSON.stringify(blockchain.chain)));
    }
    async InitLatestBlock(ctx, latestBlock){
        console.log('cc: latest block')
        console.log(latestBlock);
        // latestBlock = JSON.parse(latestBlock);
        // ctx.stub.putState('latestBlock', Buffer.from(JSON.stringify(latestBlock)));
        ctx.stub.putState('latestBlock', Buffer.from(latestBlock));
    }

    // async Init_Ledger(ctx) {
    //     const proposals =[
    //         {
    //             ID: 'proposal4',
    //             URI: 'http://localhost:3006/v1',
    //             Domain: 'Manufacturing',
    //             Valid: '1',
    //             AuthorID: 'member1',
    //             Proposal_Message: 'Add a new use case in the ontology Manufacture, the use case called Danobat',
    //             Creation_Date: '20201023',
    //             State: 'ongoing',
    //             Type: 'newProposal',
    //             OriginalID: '',
    //             NumAcceptedVotes: 0,
    //             NumRejectedVotes: 0,
    //             AcceptedVotes: [],
    //             RejectedVotes: [],
    //             Hash: 'https://ipfs.io/ipfs/QmSWDa85q8FQzB8qAnuoxZ4LDoXoWKmD6t4sPszdq5FiW2?filename=test.owl',
    //         },
    //         {
    //             ID: 'proposal5',
    //             URI: 'http://localhost:3006/v2',
    //             Domain: 'Manufacturing',
    //             Valid: '2',
    //             AuthorID: 'member2',
    //             Proposal_Message: 'Add a new use case 2',
    //             Creation_Date: '20201030',
    //             State: 'open',
    //             Type: 'vetoProposal',
    //             OriginalID: 'http://localhost:3006/v1',
    //             NumAcceptedVotes: 0,
    //             NumRejectedVotes: 0,
    //             AcceptedVotes: [],
    //             RejectedVotes: [],
    //             Hash: '',
    //         },
    //     ];
    //     const ongoingProposalQueue = [];
    //     for(const proposal of proposals){
    //         proposal.docType = 'proposal';
    //         ongoingProposalQueue.push(proposal.ID);
    //         await ctx.stub.putState(proposal.ID, Buffer.from(JSON.stringify(proposal)));
    //         // let indexName = 'proposal-order';
    //         // let ProposalOrderKey = ctx.stub.createCompositeKey(indexName, [proposal.Valid, proposal.ID]);
    //         // await ctx.stub.putState(ProposalOrderKey, null);
    //         console.info(`Proposal ${proposal.ID} initialized`);
    //     }
    //     // await ctx.stub.putState("ongoingProposal", Buffer.from(JSON.stringify(ongoingProposalQueue)));
    //     await ctx.stub.putState("ongoingProposalQueue", Buffer.from(JSON.stringify(ongoingProposalQueue)));
    //     //time is used for the count-down of the ongoing proposal
    //     //Every time we check whether (current time - time) < (valid time for each proposal),
    //     // if no the current ongoing proposal will be closed
    //     const time = Date();
    //     await ctx.stub.putState('time', Buffer.from(JSON.stringify(time)));
    //     //A closed proposal will be stored in this object. Its ID will change from 'proposalX' to 'closedproposalX'
    //     const closedProposals = [
    //         {
    //             ID: 'closedproposal1',
    //             State: 'accepted',
    //             EndDate: Date(),
    //             Veto: false
    //         },
    //         {
    //             ID: 'closedproposal2',
    //             State: 'rejected',
    //             EndDate: Date(),
    //             Veto: false
    //         },
    //         {
    //             ID: 'closedproposal3',
    //             State: 'empty',
    //             EndDate: Date(),
    //             Veto: false
    //         }
    //     ];
    //     const closedProposalQueue = [];
    //     for(const closedProposal of closedProposals){
    //         closedProposal.docType = 'closedProposal';
    //         await ctx.stub.putState(closedProposal.ID, Buffer.from(JSON.stringify(closedProposal)));
    //         console.info(`AcceptedProposal ${closedProposal.ID} initialized`);
    //         closedProposalQueue.push(closedProposal);
    //     }
    //     await ctx.stub.putState("closedProposalQueue", Buffer.from(JSON.stringify(closedProposalQueue)));
        
    //     // add visitor as default user
    //     const visitor = {
    //         ID: 'visitor',
    //         Name: 'Bob',
    //         Role: 'Visitor',
    //     }
    //     await ctx.stub.putState('visitor', Buffer.from(JSON.stringify(visitor)));
        
    //     const members = [
    //         {
    //             ID: 'member1',
    //             Name: 'Luo',
    //             Email: 'luo@gmail.com',
    //             // Role: 'Expert',
    //             // Domain: 'Manufacturing',
    //             Tokens: 2000,
    //             Total_Proposal: 0,
    //             Total_Accepted_Proposal: 0,
    //             LastParticipation: 'Sun May 1 2022 01:00:00 GMT+0000 (Coordinated Universal Time)',

    //             AllRoles: {"Manufacturing":"Expert"}
    //         },
    //         {
    //             ID: 'member2',
    //             Name: 'Benat',
    //             Email: 'benat@gmail.com',
    //             // Role: 'Lobe_Owner',
    //             // Domain: 'Manufacturing',
    //             Tokens: 100,
    //             Total_Proposal: 0,
    //             Total_Accepted_Proposal: 0,
    //             LastParticipation: 'Thu Apr 1 2021 01:00:00 GMT+0000 (Coordinated Universal Time)',

    //             AllRoles: {"Manufacturing":"Lobe Owner"}
    //         },
    //         {
    //             ID: 'member3',
    //             Name: 'Xabi',
    //             Email: 'xabi@gmail.com',
    //             // Role: 'Expert',
    //             // Domain: 'Manufacturing',
    //             Tokens: 1000,
    //             Total_Proposal: 0,
    //             Total_Accepted_Proposal: 0,
    //             LastParticipation: 'Tue Mar 1 2022 01:00:00 GMT+0000 (Coordinated Universal Time)',

    //             AllRoles: {"Manufacturing":"Expert"}
    //         },
    //         {
    //             ID: 'member4',
    //             Name: 'Ilir',
    //             Email: 'ilir@gmail.com',
    //             // Role: 'Expert',
    //             // Domain: 'Manufacturing',
    //             Tokens: 1200,
    //             Total_Proposal: 0,
    //             Total_Accepted_Proposal: 0,
    //             LastParticipation: 'Sun May 1 2021 01:00:00 GMT+0000 (Coordinated Universal Time)',

    //             AllRoles: {"Product":"Expert"}
    //         },
    //         {
    //             ID: 'member5',
    //             Name: 'Imanol',
    //             Email: 'imanol@gmail.com',
    //             // Role: 'Expert',
    //             // Domain: 'Manufacturing',
    //             Tokens: 600,
    //             Total_Proposal: 0,
    //             Total_Accepted_Proposal: 0,
    //             LastParticipation: 'Wed Dec 1 2021 01:00:00 GMT+0000 (Coordinated Universal Time)',

    //             AllRoles: {"Manufacturing":"Expert"}
    //         },
    //     ];
    //     await ctx.stub.putState('members', Buffer.from(JSON.stringify(members)));
    //     ////////////////////
    //     // sort all members to domains
    //     // the specification can be done in another file
    //     const membersInDomain = {
    //         "Manufacturing": null,
    //         "Product": null,
    //         "Power": null,
    //         "Process": null, 
    //         "Sensor": null,
    //         "SupplyChain": null,
    //         "System": null,
    //         "WiredCommunication": null,
    //     };
    //     //record the current lobe owner in a lobe
    //     const allLobeOwners = {
    //         "Manufacturing": null,
    //         "Product": null,
    //         "Power": null,
    //         "Process": null, 
    //         "Sensor": null,
    //         "SupplyChain": null,
    //         "System": null,
    //         "WiredCommunication": null,
    //     }
    //     for(let member of members){
    //         // await ctx.stub.putState(member.ID, Buffer.from(JSON.stringify(member)));
    //         for(let domain of member.AllRoles){
    //             if(membersInDomain[domain]==null)
    //                 membersInDomain[domain] = [];
    //             membersInDomain[domain].push(member.ID);
    //             if(member.AllRoles[domain]=="Lobe Owner")
    //                 allLobeOwners[domain] = member.ID;
    //         }
    //     }
    //     await ctx.stub.putState('membersInDomain', Buffer.from(JSON.stringify(membersInDomain)));
    //     // domainLobeOwners.docType = 'domains';
    //     await ctx.stub.putState('allLobeOwners', Buffer.from(JSON.stringify(allLobeOwners)));
    //     ////////////////////
    //     console.info(`Member ${allLobeOwners} initialized`);
    //     const total_members = members.length ;
    //     await ctx.stub.putState('total_members', Buffer.from(JSON.stringify(total_members)));
    //     const total_proposals = ongoingProposalQueue.length + closedProposalQueue.length;
    //     await ctx.stub.putState('total_proposals', Buffer.from(JSON.stringify(total_proposals)));

    //     // const ongoingProposal = 4;
    //     const ongoingProposal = ongoingProposalQueue[0];
    //     await ctx.stub.putState('ongoingProposal', Buffer.from(JSON.stringify(ongoingProposal)));

    //     const latestDR = 'http://localhost:3006/v0';
    //     await ctx.stub.putState('latestDR', Buffer.from(JSON.stringify(latestDR)));
    //     // download link of the ongoing proposal
    //     const fileHash = 'https://ipfs.io/ipfs/QmSWDa85q8FQzB8qAnuoxZ4LDoXoWKmD6t4sPszdq5FiW2?filename=test.owl';
    //     await ctx.stub.putState('fileHash', Buffer.from(JSON.stringify(fileHash)));


    //     ////////////////////
    //     // voted voters
    //     var voted = [];
    //     await ctx.stub.putState('voted', Buffer.from(JSON.stringify(voted)));
    //     ////////////////////
    //     // add blockchain info
    //     // blockchain initialize, run only once on new start
    //     // var blockchain = BC.loadChainFromExcel("blockchain/blockchain_hist.xlsx");
    //     var blockchain = BC.resetChain();
    //     await ctx.stub.putState('blockchain', Buffer.from(JSON.stringify(blockchain.chain)));
    //     var latestBlock = blockchain.getLatestBlock();
    //     await ctx.stub.putState('latestBlock', Buffer.from(JSON.stringify(latestBlock)));
    //     ////////////////////

    //     console.log('*******************DRChaincode*******************');
    // }

    // GetAllAssets returns all assets found in the world state.
    async GetAllData(ctx) {
        const allResults = [];
        // This is for a test, to see all the data in the world state.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    // async CheckTotalProposals(ctx){
    //     const total_roposal = await ctx.stub.getState('total_proposals');
    //     console.log(total_roposal + 'is read');
    //     return total_roposal.toString();
    // }

    //return tokens of user with 'id', to dashboard
    async CheckTokens(ctx, id) {
        //Get the tokens member with the "id" has
        console.log('memberId: '+id);        
        let members = await this.GetMembers(ctx);
        let member = members.find(member => member.ID == id);
        if(member === undefined) return -1;
        else return member.Tokens;
    }

    //return amount of total members to the dashboard
    async CheckTotalMembers(ctx){
        //Get the amount of all members. It is shown on dashboard.
        const totalMembers = await ctx.stub.getState('total_members');
        return totalMembers.toString();
    }

    //return the latest DR
    async CheckLatestDR(ctx) {
        const result = await ctx.stub.getState('latestDR');
        return JSON.parse(result.toString());
        // return JSON.stringify(result);
        // let ongoingProp = await this.GetOngoingProposal(ctx);
        // console.log('cc: CheckLatestDR '+JSON.stringify(ongoingProp));
        // if(!ongoingProp.error){
        //     // console.log(JSON.stringify(ongoingProp));
        //     var uri = ongoingProp.URI;
        // }
        // else{
        //     var uri = "we have a empty proposal here"
        // }
        // return uri !== '' ? uri : 'The file is not uploaded by the creator yet';
    }

    //return the proposal that is ongoing
    async GetOngoingProposal(ctx) {
        // let ongoingProp_ID = await ctx.stub.getState('ongoingProposal');
        // ongoingProp_ID = 'proposal' + parseInt(ongoingProp_ID);
        // let ongoingProposalQueue = JSON.parse(await ctx.stub.getState('ongoingProposalQueue'));
        let ongoingProp_ID = await ctx.stub.getState('ongoingProposal');
        console.log("cc: ongoing "+ ongoingProp_ID);
        ongoingProp_ID = JSON.parse(ongoingProp_ID);
        if(ongoingProp_ID !== 'none'){
            // let ongoingProp_ID = ongoingProposalQueue[0];
            // const ongoingProp = await ctx.stub.getState(ongoingProp_ID);
            // return JSON.parse(ongoingProp);
            return this.GetProposal(ctx, ongoingProp_ID);
        }
        else{
            return JSON.parse('{"error":"no ongoing proposal"}');
        }
    }

    // // old version
    // async OnGoingProposal(ctx) {
    //     let ongoingProp_ID = await ctx.stub.getState('ongoingProposal');
    //     // ongoingProp_ID = 'proposal' + parseInt(ongoingProp_ID);
    //     console.log("cc ongoing: "+ ongoingProp_ID);
    //     try{
    //         const ongoingProp = await ctx.stub.getState(ongoingProp_ID);
    //         return JSON.parse(ongoingProp);
    //     }catch(e){
    //         return JSON.parse(`{"error":"${ongoingProp_ID} not found"}`);
    //     }
    // }

    // should be the latest version of DR, i.e. not the ongoing one
    //Get the Hash of the ongoing proposal. If it is null, return a statement saying it is empty
    async CheckDRHash(ctx) {
        const result = await ctx.stub.getState('fileHash');
        return JSON.parse(result.toString());
        // return JSON.stringify(result);
    }

    async CheckOngoingHash(ctx) {
        let ongoingProp = await this.GetOngoingProposal(ctx);
        console.log('cc: checkDRHash '+JSON.stringify(ongoingProp));
        if(!ongoingProp.error){
            // console.log(JSON.stringify(ongoingProp));
            var hash = ongoingProp.URI;
        }
        else{
            var hash = "no ongoing proposal"
        }
        return hash !== '' ? hash : 'The file is not uploaded by the creator yet';
    }

    // gets a dictionary of all domain:lobe owner
    // async GetAllLobeOwners (ctx) {
    //     // let domains = await ctx.stub.getState('domains');
    //     let allLobeOwners = JSON.parse(await ctx.stub.getState('allLobeOwners'));
    //     // let domains = [];
    //     // for(let domain in allLobeOwners)
    //     //     domains.push(domain);
    //     // domains = JSON.parse(domains.toString());
    //     return allLobeOwners;
    // }

    async UpdateDomains(ctx, domains) {
        await ctx.stub.putState('domains', Buffer.from(JSON.stringify(domains)));
    }

    // returns a list of all member object
    async GetMembers (ctx) {
        let members = await ctx.stub.getState('members');
        members = JSON.parse(members.toString());
        return members;
    }

    async UpdateMembers (ctx, members){
        await ctx.stub.putState('members', Buffer.from(JSON.stringify(members)));
    }

    async CheckOwnProposal(ctx, prop_author_id, voter_id) {
        console.log('Voter is' + voter_id + 'Proposal author is' + prop_author_id);
        return prop_author_id.toString() === voter_id;
    }

    async GetProposal (ctx, proposalID) {
        console.log(proposalID);
        try{
            let proposal = await ctx.stub.getState(proposalID);
            console.log('cc: getproposal: '+proposal);
            proposal = JSON.parse(proposal);
            return proposal;
        } catch (e) {
            console.log('error to get proposal' + proposalID);
        }
    }

    async UpdateProposal (ctx, proposal, proposalID) {
        await ctx.stub.putState(proposalID, Buffer.from(JSON.stringify(proposal)));
    }

    async GetTotalVotes (proposal) {
        let totalVotes = proposal.NumAcceptedVotes + proposal.NumRejectedVotes;
        return totalVotes;
    }

    // Add the new vote to the proposal
    async AddVoter (proposal, voterID, voteResult, message){
        let vote = {ID: voterID, Message: message};
        
        if(voteResult === 'accept'){
            proposal.AcceptedVotes.push(vote);
            proposal.NumAcceptedVotes = proposal.AcceptedVotes.length;
        } else if (voteResult === 'reject'){
            proposal.RejectedVotes.push(vote);
            proposal.NumRejectedVotes = proposal.RejectedVotes.length;
        }

        return proposal;
    }

    // A function to remove tokens to a member.
    async RemoveTokens (ctx, member_id, numTokens) {
        const voteDeposit = 10;
        let result = -1;
        let members = await this.GetMembers(ctx);

        let member = members.find(member => member.ID == member_id);
        console.log('member is: '+member);
        if (member != undefined){
            let pos = members.indexOf(member);
            member.Tokens -= numTokens;
            if (member.Tokens < voteDeposit) member.Tokens = voteDeposit;
            member.LastParticipation = Date();
            members[pos] = member;
            await this.UpdateMembers(ctx, members);
            result = 1;
        }

        return result;
    }

    // Check whether the voter has already voted once
    async CheckVoteTwice (proposal, voterID){
        let voted = false;
        
        let member = proposal.AcceptedVotes.find(voter => voter.ID == voterID);
        if (member === undefined) member = proposal.RejectedVotes.find(voter => voter.ID == voterID);

        if(member != undefined) voted = true;

        return voted;
    }

    async CheckLobeOwnerPower(ctx, prop_domain, voter_id) {
        //check whether the vote comes from a lobe owner
        // let members = await this.GetMembers(ctx);
        // let member = members.find(member => member.ID === voter_id);
        let lobeOwner = await this.GetLobeOwner(ctx, prop_domain);
        if(voter_id !== lobeOwner) {
            return 'NotLO';
        }
        //Check whether within 24 Hours min since proposal is ongoing
        let startTime = await ctx.stub.getState('time');
        startTime = new Date(startTime);
        let currentT = new Date().getTime();
        if( (currentT - startTime) > 86400000) {
            console.log('Out of time' + (currentT - startTime));
            return 'TimeOut';
        }
        return ('LO');
    }

    async CheckVetoProposal(ctx, domain, author_id, originalID){
        // To create a veto proposal, the author should be a lobe owner
        // and the original proposal has been accepted within 30 days
        
        let lobeOwner = await this.GetLobeOwner(ctx, domain);
        if(author_id == lobeOwner){
            return true;
        }

        // let members = await this.GetMembers(ctx);
        // let member = members.find(member => member.ID === author_id);
        // if(member.Role === 'Expert'){
        //     return true;
        // }
        //check whether the original proposal has been created within 30 days
        try {
            //use the 'closedproposal' + number of the original proposal, to find the closed proposal
            const proposalID = 'closedproposal' + originalID.substring(8);
            let proposal = await ctx.stub.getState(proposalID);
            proposal = JSON.parse(proposal);
            let EndDate = proposal.EndDate;
            EndDate = new Date(EndDate);
            const currentT = new Date().getTime();
            return (currentT - EndDate.getTime()) >= 2592000000;
        } catch (e) {
            console.log('Error when getting the creation date of the proposal'+ originalID + e);
        }
    }
    
    //create a new proposal or a veto proposal
    async CreateProposal(ctx, domain, uri, author_id, message, type, originalID, download){
        //get amount of total proposals, for later update
        let total_proposals = await ctx.stub.getState('total_proposals');
        let valid = parseInt(total_proposals) + 1;
        //generate a new id
        let id = 'proposal'+ valid;
        //get the author
        let members = await this.GetMembers(ctx);
        let member = members.find(member => member.ID == author_id);
        //get the amount of tokens this author, and charge 20 tokens as deposit of the proposal
        let tokens = member.Tokens;
        tokens = parseInt(tokens) -20;
        if (tokens < 0) {
            return ('Sorry you do not have enough tokens!');
        } else {
            await this.RemoveTokens(ctx, author_id, 20);
        }
        //Check whether this proposal is a veto proposal
        if(type !== 'newProposal'){
            //Check whether the author is able to create a veto proposal
            let vetoPower = await this.CheckVetoProposal(ctx, domain, author_id, originalID);
            console.log('*****It is a veto proposal'+vetoPower + type + author_id);
            if(vetoPower !== true){
                return ('Sorry You are not able to create this veto proposal');
            }
        }
        let proposal = {
            ID: id,
            URI: uri,
            Domain: domain,
            Valid: valid.toString(),
            AuthorID: author_id,
            Proposal_Message: message,
            Creation_Date: Date(),
            State: 'ongoing',
            Type: type,
            OriginalID: originalID,
            NumAcceptedVotes: 0,
            NumRejectedVotes: 0,
            AcceptedVotes: [],
            RejectedVotes: [],
            Hash:download,
        };
        await ctx.stub.putState('total_proposals', Buffer.from(JSON.stringify(parseInt(total_proposals) + 1)));
        //the author's total proposals should increase by 1
        member.Total_Proposal = parseInt(member.Total_Proposal)+1;
        //add new proposal to the world state

        let ongoingProposalQueue = JSON.parse(await ctx.stub.getState('ongoingProposalQueue'));
        if(ongoingProposalQueue.length == 0){
            await ctx.stub.putState("ongoingProposal", Buffer.from(JSON.stringify(proposal.ID)));
        }
        ongoingProposalQueue.push(proposal.ID);
        await ctx.stub.putState("ongoingProposalQueue", Buffer.from(JSON.stringify(ongoingProposalQueue)));
        console.log(JSON.stringify(proposal));
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(proposal)));
        return ('You successfully create a proposal!');
    }
    async AddHash(ctx, hash) {
        // let ongoingprop = await ctx.stub.getState('ongoingProposal');
        let proposalID = JSON.parse(await ctx.stub.getState('ongoingProposal'));
        let proposal = await ctx.stub.getState(proposalID);
        proposal = JSON.parse(proposal);
        console.log(proposal)
        proposal.Hash = hash;
        await ctx.stub.putState(proposalID, Buffer.from(JSON.stringify(proposal)));
        console.log("added hash: " + hash);
    }

    //It is triggered when members vote for a proposal
    async ValidateProposal(ctx, prop_id, voter_id, vote, message) {
        console.log(prop_id, voter_id, vote, message);
        const tokenDeposit = 10;
        let result = {
            ProposalID: prop_id,
            Finished: false,
            Message: '',
            Result: vote
        }

        let proposal = await this.GetProposal(ctx, prop_id);
        let lobeOwner = await this.GetLobeOwner(ctx, proposal.Domain);
        console.log('proposal to vote is:' + proposal);
        console.log('lobeowner of the domain is: ' + lobeOwner);

        //check whether the voter votes for his own proposal
        const ownProposal = await this.CheckOwnProposal(ctx, proposal.AuthorID, voter_id);
        if(ownProposal === true && voter_id!=lobeOwner) {
            result.Message = 'Sorry you can not vote for your own proposal!';
            return JSON.stringify(result);
        }

        ////////////////////
        // check if the voter is in the same domain as the proposal
        // const ownProposal = await this.CheckOwnProposal(ctx, proposal.AuthorID, voter_id);
        let membersInDomain = JSON.parse(await ctx.stub.getState('membersInDomain'));
        let rightToVote = membersInDomain[proposal.Domain].includes(voter_id);
        if(rightToVote !== true) {
            result.Message = 'Sorry you can not vote for a proposal in another domain!';
            return JSON.stringify(result);
        }
        ////////////////////

        const voteTwice = await this.CheckVoteTwice(proposal, voter_id);
        if(voteTwice===true) {
            result.Message = 'Sorry you have already vote for ' + prop_id
            return JSON.stringify(result);
        }
        
        //check whether the vote comes from a lobe owner && within 24 hours since proposal has been ongoing
        let lobeownerVote = await this.CheckLobeOwnerPower(ctx, proposal.Domain, voter_id);
        console.log('The result*****' + lobeownerVote);
        try {
            if (lobeownerVote === 'TimeOut') {
                result.Message = 'Lobe Owner cannot vote after 24 hours since the proposal is ongoing';
                return JSON.stringify(result);
            }
            if(lobeownerVote === 'LO') {
                // A lobe owner votes within 24 hour, so his vote decide the result of the proposal
                // thus, EndProposal() is triggered. Remove the deposit of tokens for voting.
                console.log('*******' + proposal.URI);
                let removeResult = await this.RemoveTokens(ctx, voter_id, tokenDeposit);
                if(removeResult === -1) {
                    result.Message = 'Problems removing tokens';
                    return JSON.stringify(result);
                }

                proposal = await this.AddVoter(proposal, voter_id, vote, message);
                await this.UpdateProposal(ctx, proposal, prop_id);
                
                if(vote === 'accept') {
                    await ctx.stub.putState('latestDR', Buffer.from(JSON.stringify(proposal.URI)));
                }
                result.Message = 'Lobe Owner Successfully Vote for proposal!';
                result.Finished = true;
                return JSON.stringify(result);
            }
        } catch(e){
            console.log('********Problems when checking Lobe Owners Voting power'+e);
        }

        // Remove the deposit to the member 
        let removeResult = await this.RemoveTokens(ctx, voter_id, tokenDeposit);
        if(removeResult === -1) {
            result.Message = 'Problems removing tokens';
            return JSON.stringify(result);
        } 

        let total_members = await ctx.stub.getState('total_members');
        total_members = JSON.parse(total_members);

        // Add the vote inside the proposal
        proposal = await this.AddVoter(proposal, voter_id, vote, message);
        await this.UpdateProposal(ctx, proposal, prop_id);
        
        const totalVotes = await this.GetTotalVotes(proposal);
        // Check whether already majority members have voted fo the proposal
        // If yes, the will check the result of the proposal and then close it.
        // Here we take 50% as majority
        if(totalVotes > total_members/2) {
            let finalResult = await this.ProposalVoteResult(ctx, proposal);
            return finalResult;
        }

        result.Message = 'Successfully Vote for proposal!';

        return JSON.stringify(result);
    }

    //check the result of a proposal
    async ProposalVoteResult(ctx, proposal) {
        let result = {
            ProposalID: proposal.ID,
            Finished: true,
            Message: "Error",
            Result: -1
        }
        //For a veto proposal, if there are 70% of members vote for rejection, it will be rejected
        if (proposal.Type.toString() === 'vetoProposal') {
            if(proposal.NumRejectedVotes/(proposal.NumRejectedVotes+proposal.NumAcceptedVotes) >= 0.7) {
                result.Result = 'accept';
                result.Message = "Veto proposal voting finished as " + "accepted";
                await ctx.stub.putState('latestDR', Buffer.from(JSON.stringify(proposal.URI)));
            }
            else {
                result.Result = 'reject';
                result.Message = "Veto proposal voting finished as " + "rejected";
            }
        }
        //For a new proposal, if there are 50% of members vote for acceptance, it will be accepted
        else if (proposal.Type.toString() === 'newProposal') {
            if(proposal.NumAcceptedVotes >= proposal.NumRejectedVotes) {
                result.Result = 'accept';
                result.Message = "New proposal voting finished as " + "accepted";
                await ctx.stub.putState('latestDR', Buffer.from(JSON.stringify(proposal.URI)));
            }
            else {
                result.Result = 'reject';
                result.Message = "New proposal voting finished as " + "rejected";
            }
        }
        return result;
    }

    // Close the proposal with 'id' as 'result'
    // Reward the relative participants
    // Add the closed proposal to 'closedProposals'
    async EndProposal(ctx, proposalID, result) {
        let ongoingProposalQueue = JSON.parse(await ctx.stub.getState('ongoingProposalQueue'));
        ongoingProposalQueue.shift();
        if(ongoingProposalQueue.length > 0){
            await ctx.stub.putState('ongoingProposal', Buffer.from(JSON.stringify(ongoingProposalQueue[0])));
        }
        else{
            await ctx.stub.putState('ongoingProposal', Buffer.from(JSON.stringify('none')));
        }
        await ctx.stub.putState('ongoingProposalQueue', Buffer.from(JSON.stringify(ongoingProposalQueue)));
        
        // old version
        // //update the ongoing proposal to the next one based on creation date
        // let ongoingprop = await ctx.stub.getState('ongoingProposal');
        // await ctx.stub.putState('ongoingProposal', Buffer.from(JSON.stringify(parseInt(ongoingprop) + 1)));

        // Update the start time for ongoing proposal
        await ctx.stub.putState('time', Buffer.from(Date()));

        let proposal = await this.GetProposal(ctx, proposalID);

        ////////////////////
        // if approved, update the blockchain and latest block
        if(result=='accept'){
            let blockchain = await this.GetBlockchain(ctx);
            // console.log(blockchain);
            let latestBlock = await this.GetLatestBlock(ctx);
            let index = latestBlock.index+1;
            let timestamp = Date();
            let data = null;
            if(proposal.Type=='vetoProposal'){
                data = `vetoProposal.OriginalID:${proposal.OriginalID}`;
            }
            else
                data = `commemt: ${proposal.Proposal_Message}, file hash: ${proposal.Hash}`; // Hash or URI? Hash is unique give a specific file
            let previousHash = latestBlock.hash;
            latestBlock = new BC.Block(index, timestamp, data, previousHash);
            // console.log(blockchain);
            // console.log(latestBlock);
            blockchain.push(latestBlock);
            await ctx.stub.putState('blockchain', Buffer.from(JSON.stringify(blockchain)));
            await ctx.stub.putState('latestBlock', Buffer.from(JSON.stringify(latestBlock)));

            await ctx.stub.putState('latestDR', Buffer.from(JSON.stringify(proposal.URI)));
            await ctx.stub.putState('fileHash', Buffer.from(JSON.stringify(proposal.Hash)));
        }
        ////////////////////
        
        //Reward the voters that have vote the final result
        let resultRewarding = await this.RewardVoters(ctx, proposal, result);
        if (resultRewarding === -1) return ("Problems rewarding voters");
        
        //delete the closed proposal from world state
        // let closedProposalID = 'closedproposal' + proposal.ID.substring(8);
        let closedProposalID = proposal.ID;
        console.log(closedProposalID + '**********ClosedProposalID');
        const closedProposal = {
            ID: closedProposalID,
            State: result,
            EndDate: Date(),
            Veto: false
        };
        // let closedProposalQueue = JSON.parse(await ctx.stub.getState("closedProposalQueue"));
        let closedProposalQueue = await ctx.stub.getState("closedProposalQueue");
        if(closedProposalQueue==null){
            console.log('cc: closedProposalQueue is null')
            closedProposalQueue = [];
        }
        else
            closedProposalQueue = JSON.parse(closedProposalQueue);
        closedProposalQueue.push(closedProposalID);
        await ctx.stub.putState("closedProposalQueue", Buffer.from(JSON.stringify(closedProposalQueue)));
        await ctx.stub.putState(closedProposalID, Buffer.from(JSON.stringify(closedProposal)));
        let res = await ctx.stub.getState(closedProposalID);
        console.log(JSON.parse(res));
        // await ctx.stub.deleteState(proposal.ID);
        return ('The proposal ended as ' + result);
    }

    //Reward the voters that have vote the final result
    async RewardVoters (ctx, proposal, result) {
        const proposalDeposit = 20;
        const voteDeposit = 10;
        const reward = 10;
        let members = await this.GetMembers(ctx);
        let votes;
        let member;
        let pos;
        
        if (result === 'accept') {
            votes = proposal.AcceptedVotes;
        } else {
            votes = proposal.RejectedVotes;
        }

        // Reward voters
        for (let vote of votes) {
            member = members.find(expert => expert.ID == vote.ID);
            if (member != undefined) {
                pos = members.indexOf(member);
                members[pos].Tokens += (voteDeposit + reward);
            }
        }

        // Reward proposal author
        if (result === 'accept') {
            member = members.find(expert => expert.ID == proposal.AuthorID);
            if (member != undefined) {
                pos = members.indexOf(member);
                members[pos].Tokens += (proposalDeposit + reward);
            }
        }

        await this.UpdateMembers(ctx, members);
    }

    // Function to check the if the user has been inactive
    // If the user has been inactive they will be penalised depending on how long they have been inactive:
    // Less than six months 10 Tokens/Month
    // Six or more months but less than twelve => 100 + 20 Tokens/Month (Only the months from the sixth month onwards)
    // Twelve of more months => 300 + 30 Tokens/Month (Only the months from the twelfth month onwards)
    async CheckInactivity (ctx, memberID) {
        const perMonthUnderSix = 10;
        const sixMonthPen = 100;
        const perMonthUnderTwelve = 20;
        const twelveMonthPen = 300;
        const perMonthOverTwelve = 30;
        let members = await this.GetMembers(ctx);
        let penalization = -1;

        let member = members.find(member => member.ID == memberID);
        if(member != undefined){
            let months = await this.CalculateMonthDifference(member);
            console.log('inavtive months: '+months);
            if (months < 1){
                penalization = 0;
            } else if (months < 6) {
                penalization = months * perMonthUnderSix;
            } else if (months < 12) {
                months -= 6;
                penalization = sixMonthPen + months * perMonthUnderTwelve;
            } else if (months >= 12) {
                months -= 12;
                penalization = twelveMonthPen + months * perMonthOverTwelve;
            }

            if (penalization != 0) await this.RemoveTokens(ctx, member.ID, penalization);
        }

        return penalization;
    }

    async CalculateMonthDifference (member) {
        let currentDate = new Date();
        let lastParticipation = new Date(member.LastParticipation);
        
        let difference = currentDate.getMonth() - lastParticipation.getMonth() + 12 * (currentDate.getFullYear() - lastParticipation.getFullYear());

        return difference;
    }

    //Check if a member who is not the lobe owner but has the highest tokens under a domain
    //This member will be a new lobe owner
    async CheckNewLobOwner(ctx) {
        let members = await this.GetMembers(ctx);
        // let domains = await this.GetDomains(ctx);
        let allLobeOwners = await this.GetAllLobeOwners(ctx);
        
        // update lobe owner for every domain
        for(let domain in allLobeOwners){
            let oldLobeOwner = null;
            let newLobeOwner;
            let posOld;
            let posNew;
            console.log("current domain: "+domain);
            let oldTokens = 0;
            let oldLobeOwnerID = 'empty';
            if(allLobeOwners[domain]!=null){
                oldLobeOwnerID = allLobeOwners[domain];
                oldLobeOwner = members.find(member => member.ID == oldLobeOwnerID);
                oldTokens = oldLobeOwner.Tokens;
            }
            console.log(`old lobe owner of domain ${domain}:\n ID: ${oldLobeOwnerID}, tokens: ${oldTokens}`)
            let domainMembers = members.filter(member => {return (domain in member.Expert || domain in member.LobeOwner)  && member.ID !== oldLobeOwnerID && member.Tokens > oldTokens});            
            console.log(domainMembers);
            if(domainMembers.length > 0){
                newLobeOwner = domainMembers.reduce((prev, current) => (prev.Tokens > current.Tokens) ? prev : current);
                console.log(`new lobe owner of domain ${domain} is: ${newLobeOwner.ID}`)
                posNew = members.indexOf(newLobeOwner);
                // members[posNew].AllRoles[domain] = "Lobe Owner";
                members[posNew].LobeOwner = domain;
                allLobeOwners[domain] = newLobeOwner.ID;

                if(oldLobeOwner!=null){
                    posOld = members.indexOf(oldLobeOwner);
                    // members[posOld].AllRoles[domain] = "Expert";
                    if(!(domain in members[posOld].Expert))
                        members[posOld].Expert.push(domain);
                }
            }
        }

        /*
        for (let i = 0; i < domains.length; i++) {
            oldLobeOwner = members.find(member => member.ID === domains[i].LobeOwner);
            // Filter the array with only the members of the domain, without Lobe Owner and with more tokens than the Lobe Owner
            domainMembers = members.filter(member => {return member.Domain === domains[i].ID && member.ID !== oldLobeOwner.ID && member.Tokens > oldLobeOwner.Tokens});
            
            if (domainMembers.length > 0){
                posOld = members.indexOf(oldLobeOwner);
                newLobeOwner = domainMembers.reduce((prev, current) => (prev.Tokens > current.Tokens) ? prev : current);
                posNew = members.indexOf(newLobeOwner);

                oldLobeOwner.Role = 'Expert';
                newLobeOwner.Role = 'Lobe_Owner';
                domains[i].LobeOwner = newLobeOwner.ID;

                members[posOld] = oldLobeOwner;
                members[posNew] = newLobeOwner;
            }
        }
        */

        await this.UpdateMembers(ctx, members);
        // await this.UpdateDomains(ctx, domains);
        await this.UpdateAllLobeOwners(ctx, allLobeOwners);
        return 'Lobe Owners updated!';
    }

    async CheckTime(ctx) {
        //lastingTime is time for a proposal to be processed. Here it is set to be 5 min
        let lastingTime = 300000;
        let ongoingtime = await ctx.stub.getState('time');
        ongoingtime = new Date(ongoingtime);
        let currentT = new Date().getTime();
        let time = ongoingtime.getTime() + lastingTime- currentT;
        console.log(time);
        if(time <= 0) {
            try {
                await this.CloseProposal(ctx);
            } catch (e) {
                console.log('Fail to close a proposal without enough votes' + e);
            }
        }
    }
    
    async DRUpload_Available(ctx) {
        console.log('checking the DRUpload Right');
        let ongoingProp_ID = JSON.parse(await ctx.stub.getState('ongoingProposal'));
        // ongoingProp_ID = 'proposal' + JSON.parse(ongoingProp_ID);
        console.log('The ongoingPro ID' + ongoingProp_ID);
        let Prop = await ctx.stub.getState(ongoingProp_ID);
        Prop = JSON.parse(Prop);
        return Prop.AuthorID;
    }

    async GetMemberById(ctx, ID){
        let members = await this.GetMembers(ctx);
        let member = members.find(member => member.ID === ID);
        // let member = JSON.parse(await ctx.stub.getState(ID));
        if(member===undefined){
            return  JSON.parse(`{"error":"no member with ID ${ID}"}`);
        }
        return member;
    }

    /////////////////////
    // operation on the blockchain
    async GetBlockchain(ctx){
        let blockchain = JSON.parse(await ctx.stub.getState('blockchain'));
        // console.log(blockchain);
        return blockchain;
    }

    async GetLatestBlock(ctx){
        let latestBlock = JSON.parse(await ctx.stub.getState('latestBlock'));
        // console.log(latestBlock);
        return latestBlock;
    }

    /////////////////////

    /////////////////////
    // domains and members
    async GetAllLobeOwners(ctx){
        let allLobeOwners = JSON.parse(await ctx.stub.getState('allLobeOwners'));
        console.log(allLobeOwners);
        return allLobeOwners;
    }
    async UpdateAllLobeOwners(ctx, allLobeOwners){
        await ctx.stub.putState('allLobeOwners', Buffer.from(JSON.stringify(allLobeOwners)));
    }

    async GetLobeOwner(ctx, domain){
        let allLobeOwners = await this.GetAllLobeOwners(ctx);
        console.log(allLobeOwners);
        if(domain in allLobeOwners){
            console.log(`Lobe Owner of domain ${domain}: ${allLobeOwners[domain]}`);
            return allLobeOwners[domain];
        }
        else{
            console.log(`No domain named ${domain}`);
            return null;
        }   
    }

    async GetMembersInDomain(ctx){
        let membersInDomain = JSON.parse(await ctx.stub.getState('membersInDomain'));
        console.log(membersInDomain);
        return membersInDomain;
    }

    async UpdateInfo(ctx, key, obj){
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(obj))); 
    } 

    async GetAllOngoingProposal(ctx){
        let allOngoingProposal = [];
        let ongoingProposalQueue = JSON.parse(await ctx.stub.getState("ongoingProposalQueue"));
        console.log(ongoingProposalQueue);
        if(ongoingProposalQueue!=null)
            for(let ongoingProposal of ongoingProposalQueue){
                console.log(ongoingProposal);
                allOngoingProposal.push(await this.GetProposal(ctx, ongoingProposal));
            }
        console.log(allOngoingProposal);
        return allOngoingProposal;
    }

    async GetAllClosedProposal(ctx){
        let allClosedProposal = [];
        let closedProposalQueue = JSON.parse(await ctx.stub.getState("closedProposalQueue"));
        if(closedProposalQueue!=null)
            for(let closedProposal of closedProposalQueue){
                console.log("cc: closed proposal: "+closedProposal);
                allClosedProposal.push(await this.GetProposal(ctx, closedProposal));
            }
        console.log(allClosedProposal);
        return allClosedProposal;
    }
}

module.exports = DRChaincode;