# Digital Reference Managing System

The Digital Reference(DR) is a Semantic Web-based ontology that represents entities and their relationships in the domain of semiconductor manufacturing. It is expected to serve as a data structure that supports the collaboration among multiple parties. This project proposes a solution to manage the DR securely and trustworthy.
The DR managing system is implemented based on a private Blockchain network provided by Hyperledger Fabric. The API is realised using Node.js, while for the front end React.js is applied.
## Summary

  - [Getting Started](#getting-started)
  - [Runing the tests](#running-the-tests)
  - [Deployment](#deployment)
  - [Features](#features)
  - [Comments](#comments)
  - [Authors](#authors)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Since this project is based on the Hyperledger Fabric, you can check prerequisites here: [HyperledgerFabric-Prerequisites](https://hyperledger-fabric.readthedocs.io/en/release-1.4/prereqs.html).

-	Note
	This prerequisites are for older versions but it works. This is the new way to prepare the prerequisites: [HyperledgerFabric-Prerequisites-Latest](https://hyperledger-fabric.readthedocs.io/en/latest/prereqs.html).

	It is recomended to install Node version 14.13.1 and NPM 6.9.0 instead of the ones that are in the prerequisites for the next steps.
	(also works with Node version v16.15.1 and NPM 8.11.0)

After installing this prerequisites, it is necesary to download fabric samples: [Install Fabric and Fabric Samples](https://hyperledger-fabric.readthedocs.io/en/latest/install.html).

-	Note
	You can use Git bash for cURL comands.

Copy the folders /bin and /config from "fabric-sample" to "DRMS-Lobe\Backend".


## Deployment

### To start the Blockchain network

- Go into the folder 

		cd DRMS-Lobe/Backend/test-network
		
- Start the network with the Certificate Authority to manage identities and certificates
		
		./network.sh up -ca
		
- Create a channel for transactions between organizations in the network. Channels are only visible for members who are invited into it and invisible for other members of the system.

		./network.sh createChannel

- Deploy the chain code called basic on all members on this channel

		./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-javascript -ccl javascript

- When the chain code is updated, it should be deployed again (each time, numbers of the ccv and ccs should increase )

		./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-javascript -ccl javascript -ccv 1.1 -ccs 2

- Bring down the network when you want to close the project

		./network.sh down

- Clean the realted organization files and wallet for the network start next time:
	1. under ../Backend/test-network/organizations: delete /ordererOrganizations, /peerOrganizations
	2. under ../Backend/test-network/organizations/fabric-ca/ordererOrg: delete all files except fabric-ca-server-config.yaml
	3. under ../Backend/test-network/organizations/fabric-ca/org1: delete all files except fabric-ca-server-config.yaml
	4. under ../Backend/test-network/organizations/fabric-ca/org2: delete all files except fabric-ca-server-config.yaml
	5. under ../Backend/asset-transfer-basic/application-javascript: delete /wallet
	
	


### To start the API

- Go into the following folder:
	
		cd DRMS-Lobe/Backend/asset-transfer-basic/application-javascript
	
- If this is the first time to deploy the system, we need to install needed packages and so on

		npm install

- Start the API

		node app.js

### To start the front end

- Go into the folder Front end/

		cd DRMS-Lobe/Frontend

- If this is the first time to deploy the system, we need to install needed packages and so on

		npm install

- Run the Front end

		npm run start

- Invoke the initiating function via opening the page: [initiate](http://localhost:3001/initiate)

- Open the web application: [dashboard](https://localhost:3006/app/dashboard)

		
## Features
1. Page Login: This page provides a mock login function. The member id and password are stored in the ledger file (ledger_xxx.yaml) and the password is in plaintext, which may cause security problems in actual use.
2. Page Dashboard: here, members can see how many tokens he has, total members in the system, URI and download link of the last DR, and the latest block.
3. Page Create New Proposal: Every members can create new proposals on this page. There is at most only one ongoing proposal in the system.
4. Page Create Veto Proposal: A member can create a veto proposal, only when his role is lobe owner and the related original proposal has been closed within 30 days. For that the original proposal id needs to be specified.
5. Page Vote for a Proposal: Members can vote for the ongoing proposal in the system. If the voter's role is lobe owner, his vote will directly decide the proposal result in the first 24 hours. Otherwise, the voting process for experts starts and will end until 48 hours has passed or all the experts have voted. The proposal will be accepted if more than half of the experts voted for approval.
6. Page Blockchain: displays the whole blockchain.

## Comments
1. The web pages are set to avoid automatic refresh after operations are taken. So sometimes you need to manually refresh them and see the updated data. 
2. The system can be used for Dr in GitHub and subontologies in GitLab. For GitLab, an access token to the project needs to be specified in the ledger file.
3. The information of the current user is stored in session storage, and will persist in the same tab even after refresh.
4. In the voting process, the experts can vote within 48 hours, but this function still has some problems and sometimes the timer does not work.
5. Every a certain amount of time, the one who owns the highest tokens in each domain will be a (new) lobe owner. However, this functionality is not accomplished yet. To avoid error, this feature is kept but the time to trigger this feature is set to be quite long.

## Author
  - **Lanyingzhu Luo**
  - **Imanol Loperena Irastorza**
  - **Yipeng Liu**
