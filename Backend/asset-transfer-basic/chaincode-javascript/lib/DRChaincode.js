/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class DRChaincode extends Contract {
    //set initial value to variables
    async Init_Ledger(ctx) {
        const proposals =[
            {
                ID: 'proposal1',
                URI: 'http://localhost:3006/v1',
                Domain: 'manufacturing',
                Valid: '1',
                AuthorID: 'member1',
                Proposal_Message: 'Add a new use case in the ontology Manufacture, the use case called Danobat',
                Creation_Date: '20201023',
                State: 'ongoing',
                Type: 'newProposal',
                OriginalID: '',
                AcceptedVotes: 0,
                RejectedVotes: 0,
                Hash: 'https://ipfs.io/ipfs/QmSWDa85q8FQzB8qAnuoxZ4LDoXoWKmD6t4sPszdq5FiW2?filename=test.owl',
            },
            {
                ID: 'proposal2',
                URI: 'http://localhost:3006/v2',
                Domain: 'manufacturing',
                Valid: '2',
                AuthorID: 'member2',
                Proposal_Message: 'Add a new use case 2',
                Creation_Date: '20201030',
                State: 'open',
                Type: 'vetoProposal',
                OriginalID: 'http://localhost:3006/v1',
                AcceptedVotes: 0,
                RejectedVotes: 0,
                Hash: '',
            },
        ];
        for(const proposal of proposals){
            proposal.docType = 'proposal';
            await ctx.stub.putState(proposal.ID, Buffer.from(JSON.stringify(proposal)));
            let indexName = 'proposal-order';
            let ProposalOrderKey = ctx.stub.createCompositeKey(indexName, [proposal.Valid, proposal.ID]);
            await ctx.stub.putState(ProposalOrderKey, null);
            console.info(`Proposal ${proposal.ID} initialized`);
        }
        //time is used for the count-down of the ongoing proposal
        //Every time we check whether (current time - time) < (valid time for each proposal),
        // if no the current ongoing proposal will be closed
        const time = Date();
        await ctx.stub.putState('time', Buffer.from(JSON.stringify(time)));
        //A closed proposal will be stored in this object. Its ID will change from 'proposalX' to 'closedproposalX'
        const closedProposals = [
            {
                ID: 'closedproposal20',
                State: 'accepted',
                EndDate: Date(),
                Veto: false
            },
            {
                ID: 'closedproposal22',
                State: 'rejected',
                EndDate: Date(),
                Veto: false
            },
            {
                ID: 'closedproposal23',
                State: 'empty',
                EndDate: Date(),
                Veto: false
            }
        ];
        for(const closedProposal of closedProposals){
            closedProposal.docType = 'closedProposal';
            await ctx.stub.putState(closedProposal.ID, Buffer.from(JSON.stringify(closedProposal)));
            console.info(`AcceptedProposal ${closedProposal.ID} initialized`);
        }
        const members = [
            {
                ID: 'member1',
                Name: 'Luo',
                Email: 'luo@gmail.com',
                Role: 'Expert',
                Domain: 'Manufacturing',
                Tokens: 210,
                Total_Proposal: 0,
                Total_Accepted_Proposal: 0
            },
            {
                ID: 'member2',
                Name: 'Lan',
                Email: 'lan@gmail.com',
                Role: 'Lobe_Owner',
                Domain: 'Manufacturing',
                Tokens: 200,
                Total_Proposal: 0,
                Total_Accepted_Proposal: 0
            },
            {
                ID: 'member3',
                Name: 'Lun',
                Email: 'lan@gmail.com',
                Role: 'Expert',
                Domain: 'Manufacturing',
                Tokens: 300,
                Total_Proposal: 0,
                Total_Accepted_Proposal: 0
            }
        ];
        for(const member of members){
            member.docType = 'member';
            await ctx.stub.putState(member.ID, Buffer.from(JSON.stringify(member)));
            console.info(`Member ${member.ID} initialized`);
        }
        await ctx.stub.putState('members', Buffer.from(JSON.stringify(members)));
        //acceptVoter1 stands for voters who vote for proposal 1 as accptance
        //this array helps to record members votes and later reward them
        const acceptVoter1 = [
            {
                ID: 'member3',
                Message: 'Test'
            }
        ];
        await ctx.stub.putState('acceptVoter1', Buffer.from(JSON.stringify(acceptVoter1)));
        //Similar to acceptVoter
        const rejectVoter1 = [
            {
                ID: 'member3',
                Message: ''
            }
        ];
        await ctx.stub.putState('rejectVoter1', Buffer.from(JSON.stringify(rejectVoter1)));
        //record the current obe owner in a lobe
        const domainLobeOwners = [
            {
                ID: 'Manufacturing',
                LobeOwner: 'member2',
                Tokens: 200
            }
        ];
        for(const domain of domainLobeOwners){
            domain.docType = 'domain';
            await ctx.stub.putState(domain.ID, Buffer.from(JSON.stringify(domain)));
            console.info(`Member ${domain.ID} initialized`);
        }
        const total_members = 3;
        await ctx.stub.putState('total_members', Buffer.from(JSON.stringify(total_members)));
        const total_proposals = 3;
        await ctx.stub.putState('total_proposals', Buffer.from(JSON.stringify(total_proposals)));
        const ongoingProposal = 1;
        await ctx.stub.putState('ongoingProposal', Buffer.from(JSON.stringify(ongoingProposal)));
        const latestDR = 'http://localhost:3006/v0';
        await ctx.stub.putState('latestDR', Buffer.from(JSON.stringify(latestDR)));
        const fileHash = 'https://ipfs.io/ipfs/QmSWDa85q8FQzB8qAnuoxZ4LDoXoWKmD6t4sPszdq5FiW2?filename=test.owl';
        await ctx.stub.putState('fileHash', Buffer.from(JSON.stringify(fileHash)));

        console.log('*******************DRChaincode*******************');
    }

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

    async CheckTotalProposals(ctx){
        const total_roposal = await ctx.stub.getState('total_proposals');
        console.log(total_roposal + 'is read');
        return total_roposal.toString();
    }

    //return tokens of user with 'id', to dashboard
    async CheckTokens(ctx, id) {
        //Get the tokens member with the "id" has
        console.log('memberId'+id);
        let member = await ctx.stub.getState(id);
        member = JSON.parse(member);
        return member.Tokens;
    }

    //return amount of total members to the dashboard
    async CheckTotalMembers(ctx){
        //Get the amount of all members. It is shown on dashboard.
        const totalMembers = await ctx.stub.getState('total_members');
        return totalMembers.toString();
    }

    //return the latest DR
    async CheckLatestDR(ctx) {
        //Check the id of the latest DR
        const result = await ctx.stub.getState('latestDR');
        return result.toString();
    }

    //return the proposal that is ongoing
    async OnGoingProposal(ctx) {
        //Get the ongoing proposal
        let ongoingProp_ID = await ctx.stub.getState('ongoingProposal');
        ongoingProp_ID = 'proposal' + parseInt(ongoingProp_ID);
        const ongoingProp = await ctx.stub.getState(ongoingProp_ID);
        return JSON.parse(ongoingProp);
    }

    async CheckDRHash(ctx) {
        //Get the Hash of the ongoing proposal. If it is null, return a statement saying it is empty
        const ongoingProp = await this.OnGoingProposal(ctx);
        const hash = ongoingProp.Hash;
        return hash !== null ? hash : 'The file is not uploaded by the creator yet';
    }

    //create a new proposal or a veto proposal
    async CreateProposal(ctx, domain, uri, author_id, message, type, originalID){
        //get amount of total proposals, for later update
        let total_proposals = await ctx.stub.getState('total_proposals');
        let valid = parseInt(total_proposals) + 1;
        //generate a new id
        let id = 'proposal'+ valid;
        //get the author
        let member = await ctx.stub.getState(author_id);
        member = JSON.parse(member);
        //get the amount of tokens this author, and charge 20 tokens as deposit of the proposal
        let tokens = member.Tokens;
        tokens = parseInt(tokens) -20;
        if (tokens < 0) {
            return ('Sorry you do not have enough tokens!');
        } else {
            member.Tokens = tokens;
        }
        //Check whether this proposal is a veto proposal
        if(type !== 'newProposal'){
            //Check whether the author is able to create a veto proposal
            let vetoPower = await this.CheckVetoProposal(ctx, type, author_id, originalID);
            console.log('*****It is a veto proposal'+vetoPower + type + author_id);
            if(vetoPower === true){
                return ('Sorry You are not able to create this veto proposal');
            }
        }
        const proposal = {
            ID: id,
            URI: uri,
            Domain: domain,
            Valid: valid.toString(),
            AuthorID: author_id,
            Proposal_Message: message,
            Creation_Date: Date(),
            State: 'open',
            Type: type,
            OriginalID: originalID,
            AcceptedVotes: 0,
            RejectedVotes: 0,
            Hash:'',
        };
        await ctx.stub.putState('total_proposals', Buffer.from(JSON.stringify(parseInt(total_proposals) + 1)));
        //the author's total proposals should increase by 1
        member.Total_Proposal = parseInt(member.Total_Proposal)+1;
        await ctx.stub.putState(author_id, Buffer.from(JSON.stringify(member)));
        //add new proposal to the world state
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(proposal)));
        return ('You successfully create a proposal!');
    }

    //
    async CheckVetoProposal(ctx, type, author_id, originalID){
        // To create a veto proposal, the author should be a lobe owner
        // and the original proposal has been accepted within 30 days
        let member = await ctx.stub.getState(author_id);
        member = JSON.parse(member);
        if(member.Role === 'Expert'){
            return true;
        }
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

    //It is triggered when members vote for a proposal
    async ValidateProposal(ctx,prop_id, voter_id, vote, message) {
        console.log(prop_id, voter_id, vote, message);
        let proposal = await ctx.stub.getState(prop_id);
        try{
            proposal = JSON.parse(proposal);
        } catch (e) {
            console.log('error to get proposal' + prop_id);
        }

        //check whether the voter votes for his own proposal
        const ownProposal = await this.CheckOwnProposal(ctx, proposal.AuthorID, voter_id);
        if(ownProposal === true) {
            return ('Sorry you can not vote for your own proposal!');
        }

        //check whether the voter already voted once
        const acceptVID = 'acceptVoter'+prop_id.substring(8);
        const rejectVID = 'acceptVoter' + prop_id.substring(8);
        console.log('****AcceptVoterID'+acceptVID);
        let acceptVoter = await ctx.stub.getState(acceptVID);
        let rejectVoter = await ctx.stub.getState(rejectVID);

        // Here should also be a check, whether a voter has already voted once. If yes, he cannot vote gain.
        // However, for the easy of test of the system performance we comment the CheckVoteTwice function
        // Please cancel the comment if you need this check
        const voteTwice = await this.CheckVoteTwice(ctx, acceptVoter, rejectVoter, voter_id);
        if(voteTwice===true) {
            return ('Sorry you have already vote for ' + prop_id);
        }

        //check whether the vote comes from a lobe owner && within 24 hours since proposal has been ongoing
        let lobeownerVote = await this.CheckLobeOwnerPower(ctx, prop_id, voter_id, vote);
        console.log('The result*****' + lobeownerVote);
        try {
            if (lobeownerVote === 'TimeOut') {
                return ('********Lobe Owner cannot vote after 24 hours since the proposal is ongoing');
            }
            if(lobeownerVote === 'LO') {
                // A lobe owner votes within 24 hour, so his vote decide the result of the proposal
                // thus, EndProposal() is triggered
                console.log('*******' + proposal.URI);
                if(vote === 'accept') {
                    await ctx.stub.putState('latestDR', Buffer.from(JSON.stringify(proposal.URI)));
                }
                await this.EndProposal(ctx, prop_id, vote);
                return ('*******Lobe Owner Successfully Vote for proposal!');
            }
        } catch(e){
            console.log('********Problems when checking Lobe Owners Voting power'+e);
        }

        //Handle votes from normal experts
        let total_members = await ctx.stub.getState('total_members');
        total_members = JSON.parse(total_members);

        //collect result of this vote
        const totalVotes = proposal.AcceptedVotes + proposal.RejectedVotes +1;
        if (vote === 'accept') {
            acceptVoter = JSON.parse(acceptVoter);
            acceptVoter.push({ID: voter_id, Message: message});
            proposal.AcceptedVotes = parseInt(proposal.AcceptedVotes) + 1;
        } else if (vote === 'reject'){
            rejectVoter = JSON.parse(rejectVoter);
            rejectVoter.push({ID: voter_id, Message: message});
            proposal.RejectedVotes = parseInt(proposal.RejectedVotes) + 1;
        }
        await ctx.stub.putState(prop_id, Buffer.from(JSON.stringify(proposal)));
        await ctx.stub.putState('acceptVoter'+prop_id.substring(8), Buffer.from(JSON.stringify(acceptVoter)));
        await ctx.stub.putState('rejectVoter'+prop_id.substring(8), Buffer.from(JSON.stringify(rejectVoter)));
        console.log('***check more than half of members voted');
        
        // Check whether already majority members have voted fo the proposal
        // If yes, the will check the result of the proposal and then close it.
        // Here we take 50% as majority
        if(totalVotes > total_members/2) {
            let result = await this.ProposalVoteResult(ctx,proposal.Type, voter_id ,proposal.ID, parseInt(proposal.AcceptedVotes), parseInt(proposal.RejectedVotes), proposal.URI);
            return ('*************Invoke Result Checking Function*********' + result + totalVotes);
        }

        return('Successfully Vote for proposaaal!');
    }

    async CheckOwnProposal(ctx, prop_id, voter_id) {
        console.log('Voter is' + voter_id + 'Proposal author is' + prop_id);
        return prop_id.toString() === voter_id;
    }

    // Check whether the voter has already voted once
    async CheckVoteTwice(ctx, acceptVoter, rejectVoter, voter_id) {
        console.log('CheckVoteTwice')
        const aVoter = JSON.parse(acceptVoter);
        const rVoter = JSON.parse(rejectVoter);
        const voters = aVoter.concat(rVoter);
        for (const voter of voters) {
            if (voter.ID === voter_id){
                return true;
            }
        }
        return false;
    }

    async CheckLobeOwnerPower(ctx, prop_id, voter_id, vote) {
        //check whether the vote comes from a lobe owner
        let member = await ctx.stub.getState(voter_id);
        member = JSON.parse(member);
        if(member.Role !== 'Lobe_Owner') {
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

    //check the result of a proposal
    async ProposalVoteResult(ctx, prop_type, author_id, id, accept, reject, uri) {
        //For a veto proposal, if there are 70% of members vote for rejection, it will be rejected
        if (prop_type.toString() === 'vetoProposal') {
            if(reject/(reject+accept) >= 0.7) {
                await ctx.stub.putState('latestDR', Buffer.from(JSON.stringify(uri)));
                return this.EndProposal(ctx, id, 'accept');
            }
            else {
                return await this.EndProposal(ctx, id, 'reject');
            }
        }
        //For a new proposal, if there are 50% of members vote for acceptance, it will be accepted
        else if (prop_type.toString() === 'newProposal') {
            if(accept >= reject) {
                await ctx.stub.putState('latestDR', Buffer.from(JSON.stringify(uri)));
                return this.EndProposal(ctx, id, 'accept');
            }
            else {
                return await this.EndProposal(ctx, id, 'reject');
            }
        }
    }

    // Close the proposal with 'id' as 'result'
    // Reward the relative participants
    // Add the closed proposal to 'closedProposals'
    async EndProposal(ctx, id, result) {
        //update the ongoing proposal to the next one based on creation date
        let ongoingprop = await ctx.stub.getState('ongoingProposal');
        await ctx.stub.putState('ongoingProposal', Buffer.from(JSON.stringify(parseInt(ongoingprop) + 1)));
        // Update the start time for ongoing proposal
        await ctx.stub.putState('time', Buffer.from(Date()));
        //get voters whose vote is the same to the result
        let votersID = result + 'Voter'+id.substring(8);
        let voters = await ctx.stub.getState(votersID);
        console.log('Get Voter:'+votersID);
        voters = JSON.parse(voters);
        try{
            for (let voter of voters) {
                console.log('voterID'+voter.ID);
                let id = voter.ID;
                console.log('*****ID' + id);
                let member = await ctx.stub.getState(id);
                member = JSON.parse(member);
                member.Tokens += 10;
                console.log('******Tokens' + member.Tokens);
                await ctx.stub.putState(id, Buffer.from(JSON.stringify(member)));
            }
        }catch (e) {
            console.log('Error'+e+voters.length);
        }
        //reset the acceptVoter and the rejectVoter
        let currentID = id.substring(8);
        let nextID = parseInt(currentID)+1;
        console.log('NextID**********'+nextID);
        // Reset the acceptVoter and rejectVoter for the next ongoing proposal.
        await ctx.stub.deleteState('acceptVoter'+currentID);
        await ctx.stub.deleteState('rejectVoter'+currentID);
        //To create new acceptVoter and rejectVoter, a initial value is set as 'acceptNew' and 'rejectNew'
        // This means that member 3 receives 10 tokens even he did nothing
        // A better way is needed to set the initial value
        const acceptNew = [
            {
                ID: 'member3',
                Message: 'Test'
            }
        ];
        const rejectNew = [
            {
                ID: 'member3',
                Message: ''
            }
        ];
        await ctx.stub.putState('acceptVoter'+nextID, Buffer.from(JSON.stringify(acceptNew)));
        await ctx.stub.putState('rejectVoter'+nextID, Buffer.from(JSON.stringify(rejectNew)));
        //delete the closed proposal from world state
        let closedProposalID = 'closedproposal' + id.substring(8);
        console.log(closedProposalID + '**********ClosedProposalID');
        const closedProposal = {
            ID: closedProposalID,
            State: result,
            EndDate: Date(),
            Veto: false
        };
        await ctx.stub.putState(closedProposalID, Buffer.from(JSON.stringify(closedProposal)));
        await ctx.stub.deleteState(id);
        return ('The proposal ended as' + result);
    }

    //Check if a member who is noe the lobe owner but has the highest tokens under a domain
    //This member will be a new lobe owner
    async CheckNewLobeOwner(ctx) {
        let members = await ctx.stub.getState('members');
        members = JSON.parse(members);
        console.log('*********1' + members[0].Domain);
        for (const member of members) {
            console.log('*********2' + member.Domain.toString());
            let domain = await ctx.stub.getState(member.Domain);
            domain = JSON.parse(domain);
            console.log('*********3' + domain.LobeOwner);
            if (member.Tokens > domain.Tokens) {
                let oldLO = await ctx.stub.getState(domain.LobeOwner);
                oldLO = JSON.parse(oldLO);
                oldLO.Role = 'Expert';
                await ctx.stub.putState(oldLO.ID, Buffer.from(JSON.stringify(oldLO)));
                console.log('*********4' + oldLO.ID);
                domain.LobeOwner = member.ID;
                domain.Tokens = member.Tokens;
                await ctx.stub.putState(member.Domain, Buffer.from(JSON.stringify(domain)));
                let newMember = await ctx.stub.getState(member.ID);
                newMember.Role = 'Lobe_Owner';
                await ctx.stub.putState((member.ID).toString(), Buffer.from(JSON.stringify(newMember)));
            }
        }
        return ('accomplish checking new Lobe Owner');
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
        console.log(' checking the DRUpload Right');
        let ongoingProp_ID = await ctx.stub.getState('ongoingProposal');
        ongoingProp_ID = 'proposal' + JSON.parse(ongoingProp_ID);
        console.log('The ongoingPro ID' + ongoingProp_ID);
        let Prop = await ctx.stub.getState(ongoingProp_ID);
        Prop = JSON.parse(Prop);
        return Prop.AuthorID;
    }
}

module.exports = DRChaincode;
