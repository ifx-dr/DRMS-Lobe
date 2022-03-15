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

After installing this prerequisites, it is necesary to download fabric samples: [Install Fabric and Fabric Samples](https://hyperledger-fabric.readthedocs.io/en/latest/install.html).

-	Note
	You can use Git bash for cURL comands.

Copy the folders /bin and /config from "fabric-sample" to "DR-System-Final\Backend".


## Deployment

### To start the Blockchain network

- Go into the folder 

		cd DR-System-Final/Backend/test-network
		
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
	
		cd DR-System-Final/Backend/asset-transfer-basic/application-javascript
	
- If this is the first time to deploy the system, we need to install needed packages and so on

		npm install

- Start the API

		node app.js

### To start the front end

- Go into the folder Front end/

		cd DR-System-Final/Frontend

- If this is the first time to deploy the system, we need to install needed packages and so on

		npm install

- Run the Front end

		npm run start

- Invoke the initiating function via opening the page: [initiate](http://localhost:3001/initiate)

- Open the web application: [dshboard](http://localhost:3006/app/dashboard)

		
## Features
1. Page Login: This page provides a mock login function. To interact with the project, please first type in a member id, such as member1, member2, member3, and so on (Only ID is enough, PWD is not necessary).
2. Page Dashboard: here, members can see how many tokens he has, total members in the system, URI and Hash value of the last DR, as well as a window for members to upload the DR. Note, only the author of the current ongoing proposal has access to upload DR file, others will be rejected.
3. Page Create New Proposal: Every members can create new proposals on this page
4. Page Create Veto Proposal: A member can create a veto proposal, only when his role is lobe owner and the related original proposal has been closed within 30 days. Another important point is the format of the input Original Proposal ID, you can typr in proposal22 as an input. It stands for proposals that are already closed. The format of this input should be still proposalX, while a proposal called closedproposalX exists in the object closedProposals
5. Page Vote for a Proposal: Members can vote for the ongoing proposal in the system. If the voters role is lobe owner, his vote will directly decide the proposal result. Otherwise, the votes will be collected until there are more than 50% of members have participated.
6. For a test purpose, all the data in the system is visible under the link: http:localhost//3001/allData

## Comments
1. The web pages are set to avoid automatic refresh after operations are taken. So sometimes you need to manually refresh them and see the updated data. Also, for the page Login, there is no response after you submit a member ID. If you refresh the web page, the member ID will be lost, you need to type it again on the Login page.
2. Every a certain amount of time, the one who owns the highest tokens in each domain will be a (new) lobe owner. However, this functionality is not accomplished yet. TO avoid error, this feature is kept but the time to trigger this feature is set to be quite long.
## Author

  - **Lanyingzhu Luo**
  - **Imanol Loperena Irastorza**