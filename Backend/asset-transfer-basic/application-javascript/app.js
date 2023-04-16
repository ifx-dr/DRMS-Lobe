/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';
var express = require("express");
var app = express();
const cors = require('cors');
// var busboy = require('connect-busboy');
var busboy = require('busboy');
var multer = require('multer');

const fs = require('fs');
const yaml = require('js-yaml')
const crypto = require("crypto");
const BC = require('./blockchain/blockchain')
const algorithm = "aes-256-cbc"; 
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');
const { json } = require("express");

const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';
const gateway = new Gateway();

const memberAssetCollectionName = 'assetCollection';
const org1PrivateCollectionName = 'Org1MSPPrivateCollection';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

const retry_cnt = 3;
var NewProposalLock = true;
var VaidateProposalLock = true;
var NewBlockLock = true;
var allDomains = [];
var ontologyName = '';
var repo = '';
var accessToken = '';
var defaultBranch = '';
var fileName = '';
var outFileName = '';
// specify the config file to change project
// var ledgerFile = 'ledger_sub_OrderManagement.yaml';
// var ledgerFile = 'ledger_sub_PMV.yaml';
var ledgerFile = 'ledger_sub.yaml';
var platform = '';
var newBlockRequest = null;

var layerInfo = null;
var latestBlockInfo = [];

var layerInfoShort = {};
let allRepos = {};
var blockDataPreview = null;

app.use(express.json());
// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// for parsing files in req.body
// app.use(busboy());
// for parsing multipart/form-data
app.use(express.static('public'));
app.use(cors());
async function main() {
	try {
		// build an in memory object with the network configuration (also known as a connection profile)
		const ccp = buildCCPOrg1();

		// build an instance of the fabric ca services client based on
		// the information in the network configuration
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

		// setup the wallet to hold the credentials of the application user
		const wallet = await buildWallet(Wallets, walletPath);

		// in a real application this would be done on an administrative flow, and only once
		await enrollAdmin(caClient, wallet, mspOrg1);

		// in a real application this would be done only when a new user was required to be added
		// and would be part of an administrative flow
		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

		// Create a new gateway instance for interacting with the fabric network.
		// In a real application this would be done as the backend server session is setup for
		// a user that has been verified.

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);
			// contract.addDiscoveryInterest({ name: chaincodeName, collectionNames: [org1PrivateCollectionName] });

			// app.get("/private", async(req, res)=>{
			// 	console.log('get private data from PDC');
			// 	let result = await contract.evaluateTransaction('ReadPrivateAsset', org1PrivateCollectionName, "privateData");
			// 	console.log(JSON.parse(result));
			// 	res.json(JSON.parse(`{"success":${JSON.stringify(result)}}`));
			// })
			// app.get("/crypto", async(req, res)=>{
			// 	console.log('get symmetric key from PDC');
			// 	let result = JSON.parse(await contract.evaluateTransaction('GetSymmetricKey'));
			// 	console.log(result);
			// 	let data = Buffer.from(result.data);
			// 	let cryptoMaterials = JSON.parse(data.toString());
			// 	console.log(data.toString());
			// 	console.log(cryptoMaterials.IV);
			// 	res.json(JSON.parse(`{"success":${JSON.stringify(result)}}`));
			// })

			// let fileContents = fs.readFileSync('ledger.yaml', 'utf8');
			// let ledger = yaml.load(fileContents);
			
			// allDomains = ledger['OntologyInfo']['Domains'];
			// ontologyName = ledger['OntologyInfo']['Name'];
			// console.log(allDomains)
			// console.log(ontologyName)
			app.get("/initiate", async (req, res) => {
				console.log('*****read ledger file*****')
				let fileContents = fs.readFileSync(ledgerFile, 'utf8');
				let ledger = yaml.load(fileContents);
				allDomains = ledger['OntologyInfo']['Domains'];
				ontologyName = ledger['OntologyInfo']['Name'];
				repo = ledger['OntologyInfo']['Repo'];
				defaultBranch = ledger['OntologyInfo']['Default'];
				fileName = ledger['BlockchainInfo']['FileName'];
				outFileName = ledger['BlockchainInfo']['OutFileName'];
				platform = ledger['OntologyInfo']['Platform'];
				newBlockRequest = ledger['NewBlockRequest'];
				if(platform==='GitLab')
					accessToken = ledger['OntologyInfo']['AccessToken'];

				layerInfo = ledger['LayerInfo'];
				for(let layer of layerInfo){
					
					let data = {
						ID: layer['ID'],
						LayerName: layer["LayerName"],
						BlockInfo: []
					}
					for(let ontology of layer["OntologyInfo"]){
						let blockchain_file = ontology['BlockchainInfo']['FileName'];
						let blockchain = BC.loadChainFromExcel(blockchain_file);
						data.BlockInfo.push({
							Ontology: ontology['Name'],
							Block: blockchain.getLatestBlock()
						});
					}
					latestBlockInfo.push(data);
				}
				console.log(latestBlockInfo)
				
				if(!fs.existsSync(fileName)){
					fs.writeFileSync(fileName, '', 'utf8');
				}
				
				let blockchain = BC.loadChainFromExcel(fileName);
				// console.log(blockchain);
				let latestBlock = blockchain.getLatestBlock();

				let allBlockchains = {};
				let allLatestBlocks = {};
				
				for(let layer of layerInfo){
					for(let ontology of layer["OntologyInfo"]){
						let ontologyKey = `[${layer.LayerName}] ${ontology.Name}`;
						let blockchain_file = ontology['BlockchainInfo']['FileName'];
						let blockchain = BC.loadChainFromExcel(blockchain_file);
						allBlockchains[ontologyKey] = blockchain.chain;
						allLatestBlocks[ontologyKey] = blockchain.getLatestBlock();
						allRepos[ontologyKey] = {
							Name: ontology.Name,
							Platform: ontology.Platform,
							Repo: ontology.Repo,
							Default: ontology.Default,
							AccessToken: ontology.AccessToken,
						}
					}
				}
				console.log(`allBlockchains: ${JSON.stringify(allBlockchains)}\n`)
				console.log(`allLatestBlocks: ${JSON.stringify(allLatestBlocks)}\n`)
				console.log(`allRepos: ${JSON.stringify(allRepos)}\n`)

				let flag = false;
				let result;
				for(let i=0;i<retry_cnt;i++){
					try {
						await contract.submitTransaction('InitLedgerFromFile', JSON.stringify(ledger));
						await contract.submitTransaction('WriteBlockchain', JSON.stringify(blockchain));
						await contract.submitTransaction('WriteLatestBlock', JSON.stringify(latestBlock), platform, ontologyName);
						
						await contract.submitTransaction('WriteAllBlockchains', JSON.stringify(allBlockchains))
						await contract.submitTransaction('WriteAllLatestBlocks', JSON.stringify(allLatestBlocks), JSON.stringify(allRepos))
						
						
						let res = `ledger initialized from file, time: ${Date()}`;
						console.log(`SUCCESS app initiate: ${res}`)
						result = {"success":res};
						flag = true;
						break;
					} catch (error) {
						let res = error;
						result = {"error":error.toString()}
						console.log(`FAILED ${i} app initiate, time: ${Date()}, ${res}`)
					}
				}
				res.json(result);
			})
			app.get("/saveStatus", async (req, res) => {
				console.log('*****save system status: members, ongoing and closed proposals****');
				// await contract.submitTransaction('SaveSystemStatus');
				let result;
				for(let i=0;i<retry_cnt;i++){
					try {
						let ledger = {};
						ledger["OntologyInfo"] = {
							Name: ontologyName,
							Domains: allDomains,
							Repo: repo,
							Default: defaultBranch,
							Platform: platform,
						}
						ledger["BlockchainInfo"] = {
							FileName: fileName,
							OutFileName: outFileName
						};
						ledger["LayerInfo"] = layerInfo
						ledger["UserInfo"] = JSON.parse(await contract.evaluateTransaction('GetMembers'));
						ledger["OngoingProposalInfo"] = JSON.parse(await contract.evaluateTransaction("GetAllOngoingProposal"));
						ledger["ClosedProposalInfo"] = JSON.parse(await contract.evaluateTransaction("GetAllClosedProposal"));
						ledger['AllNewBlockRequests'] = JSON.parse(await contract.evaluateTransaction("GetAllNewBlockRequests"));
						// if(platform==='GitLab')
						ledger['OntologyInfo']['AccessToken'] = accessToken;
						ledger['NewBlockRequest'] = newBlockRequest;
						let yamlStr = yaml.dump(ledger);
						fs.writeFileSync(ledgerFile, yamlStr, 'utf8');
						

						for(let layer of layerInfo){
							for(let ontology of layer['OntologyInfo']){
								let outFileName = ontology['BlockchainInfo']['OutFileName'];
								let ontologyKey = `[${layer['LayerName']}] ${ontology['Name']}`
								let chain = JSON.parse(await contract.evaluateTransaction("GetBlockchainByKey", ontologyKey))
								BC.exportChainOnlyToExcel(chain, outFileName);
							}
						}
						// let latestBlock = JSON.parse(await contract.evaluateTransaction("GetLatestBlock"))
						result = {"success":"ledger saved"};
						console.log(`SUCCESS app saveStatus, time: ${Date()}`);
						break;
					} catch (error) {
						console.log(`FAILED ${i} app saveStatus, time: ${Date()}, ${error}`);
						result = {"error":error.toString()}
					}
				}
				res.json(result);
			});
			app.get("/initiate_origin", async (req, res) => {
				// Initialize a set of data on the channel using the chaincode 'Init_Ledger' function.
				// This type of transaction would only be run once by an application the first time it was started after it
				// deployed the first time.
				console.log('*****create variables and set initiate value****');
				await contract.submitTransaction('Init_Ledger');

				// let assetData = {
				// 	name:"simple test",
				// 	prop:100
				// };
				// let statefulTxn = contract.createTransaction('CreatePrivateAsset');
				// let tmapData = Buffer.from(JSON.stringify(assetData));
				// console.log(tmapData);
				// statefulTxn.setTransient({
				// 	asset_properties: tmapData
				// });
				// let result = await statefulTxn.submit();
				// console.log(JSON.stringify(result))

				// await contract.submitTransaction('GenerateSymmetricKey');
				res.json(JSON.parse('{"success":"ledger initialized"}'));
			});
			//Check whether a proposal is expired every 1 min
			let NewLobeOwner = setInterval(async function(str1, str2) {
				let newLobeOwner = await contract.submitTransaction('CheckNewLobeOwner');
				console.log("********" + newLobeOwner);
			}, 60000000);
			//Check whether a proposal is expired every 10 min
			let interval = setInterval(async function(str1, str2) {
				await network.connectNetwork();
				let contract = await network.getContract();
				let time = await contract.submitTransaction('CheckTime');
				console.log("*****Here" + time);
			}, 60000000);
			app.get("/allData", async (req,res) => {
				//To get all the data , this will be sent to just one peer and the results will be shown
				let result = await contract.evaluateTransaction('GetAllData');
				console.log(`*** Result: ${prettyJSONString(result.toString())}`);
				res.json(JSON.parse(result.toString()));
			});
			app.get("/allMembers", async (req, res) => {
				//Get the amount of members in the system
				let result;
				for(let i=0;i<retry_cnt;i++){
					try {
						let res = await contract.evaluateTransaction('CheckTotalMembers');
						console.log(`SUCCESS app allMembers: ${res}`);
						result = {"success":JSON.parse(res)};
						break;
					} catch (error) {
						console.log(`FAILED ${i} app allMembers: ${error}`);
						result = {"error":error.toString()};
					}
				}
				res.json(result);
			});
			app.get("/Repo", async (req, res) => {
				let result = {"success":{
					Platform: platform,
					RepoName: repo,
					DefaultBranch: defaultBranch,
					AccessToken: accessToken
				}};
				res.json(result);
			});
			app.get("/AllRepos", async (req, res) => {
				let result = {"success": allRepos};
				console.log(`SUCCESS app AllRepos: ${JSON.stringify(allRepos)}`)
				res.json(result);
			});
			app.get("/LayerInfo", async (req, res) => {
				let result = {"success":{
					LayerInfo: layerInfo
				}};
				res.json(result);
			});
			app.get("/LayerInfoShort", async (req, res) => {
				let result = {"success":layerInfoShort};
				res.json(result);
			});
			app.get("/AllLatestBlocks", async (req, res) => {
				let result = {"success":{
					data: latestBlockInfo
				}};
				res.json(result);
			});
			app.get("/DR", async (req, res) => {
				//Get the URI of the latest  DR
				let result;
				for(let i=0;i<retry_cnt;i++){
					try {	
						let res = await contract.evaluateTransaction('CheckLatestDR');
						console.log(`SUCCESS app CheckLatestDR: ${res}`);
						result = {"success":res.toString()};
						break;
					} catch (error) {
						console.log(`FAILED ${i} app CheckLatestDR: ${error}`);
						result = {"error":error.toString()};
					}
				}
				res.json(result);
			});
			app.get("/AllLatestDR", async (req, res) => {
				//Get the URI of the latest  DR
				let result;
				for(let i=0;i<retry_cnt;i++){
					try {	
						let res = await contract.evaluateTransaction('GetAllLatestDR');
						console.log(`SUCCESS app AllLatestDR: ${res}`);
						result = {"success":JSON.parse(res)};
						break;
					} catch (error) {
						console.log(`FAILED ${i} app CheckLatestDR: ${error}`);
						result = {"error":error.toString()};
					}
				}
				res.json(result);
			});
			app.get("/OngoingDR", async (req, res) => {
				//Get the URI of the ongoing  DR
				let result;
				for(let i=0;i<retry_cnt;i++){
					try {
						let res = await contract.evaluateTransaction('CheckOngoingHash');
						console.log(`SUCCESS app CheckOngoingDR: ${res}`);
						result = {"success":res.toString()};
						break;
					} catch (error) {
						console.log(`FAILED ${i} app CheckOngoingDR: ${error}`);
						result = {"error":error.toString()};
					}
				}
				res.json(result);
			});
			app.get("/DRHash", async (req, res) => {
				//Get the Hash value of the latest DR
				let result;
				for(let i=0;i<retry_cnt;i++){
					try {
						let res = await contract.evaluateTransaction('CheckDRHash');
						console.log(`SUCCESS app CheckDRHash: ${res}`);
						result = {"success":res.toString()};
						break;
					} catch (error) {
						console.log(`FAILED ${i} app CheckDRHash: ${error}`);
						result = {"error":error.toString()};
					}
				}
				res.json(result);})
			app.get("/AllFileHashes", async (req, res) => {
				//Get the Hash value of the latest DR
				let result;
				for(let i=0;i<retry_cnt;i++){
					try {
						let res = await contract.evaluateTransaction('GetAllFileHashes');
						console.log(`SUCCESS app AllFileHashes: ${res}`);
						result = {"success":JSON.parse(res)};
						break;
					} catch (error) {
						console.log(`FAILED ${i} app AllFileHashes: ${error}`);
						result = {"error":error.toString()};
					}
				}
				res.json(result);
			});
			app.get("/checkNewBlockRequest", async (req, res) => {
				//check if there is a new block to be generated
				let result;
				for(let i=0;i<retry_cnt;i++){
					try {
						let res = await contract.evaluateTransaction('GetNewBlockRequest');
						console.log(`SUCCESS app GetNewBlockRequest: ${res}`);
						result = {"success":JSON.parse(res)};
						break;
					} catch (error) {
						console.log(`FAILED ${i} app GetNewBlockRequest: ${error}`);
						result = {"error":error.toString()};
					}
				}
				res.json(result);
			});
			app.get("/checkAllNewBlockRequests", async (req, res) => {
				//check all new block requests, return a list
				let result;
				for(let i=0;i<retry_cnt;i++){
					try {
						let res = await contract.evaluateTransaction('GetAllNewBlockRequests');
						console.log(`SUCCESS app checkAllNewBlockRequests: ${res}`);
						result = {"success":JSON.parse(res)};
						break;
					} catch (error) {
						console.log(`FAILED ${i} app checkAllNewBlockRequests: ${error}`);
						result = {"error":error.toString()};
					}
				}
				res.json(result);
			});
			app.post("/getBlockDataPreview", async (req, res) => {
				let result;
				for(let i=0;i<retry_cnt;i++){
					try {
						console.log(`req.body.proposalID:${req.body.proposalID}`)
						let proposal = JSON.parse(await contract.evaluateTransaction('GetProposal', req.body.proposalID));
						console.log('here')
						blockDataPreview = {
							ProposedVersion: proposal.URI,
							UpdatedVersion: req.body.data,
							Message: proposal.Proposal_Message,
							Author: proposal.AuthorID,
							Domain: proposal.Domain,
							LobeOwner: proposal.LobeOwner,
							Result: proposal.State
						};
						console.log(`SUCCESS app getBlockDataPreview: ${JSON.stringify(blockDataPreview)}`);
						result = {"success":blockDataPreview};
						break;
					} catch (error) {
						console.log(`FAILED ${i} app getBlockDataPreview: ${error}`);
						result = {"error":error.toString()};
					}
				}
				res.json(result);
			})
			app.post("/generateBlock", async (req, res) => {
				if(!NewBlockLock){
					res.json({"success":"please wait"});
				}
				else{
					NewBlockLock = !NewBlockLock;
					let result;
					for(let i=0;i<1;i++){
						try {
							let res = await contract.evaluateTransaction('GetBlockchainByKey', req.body.ontologyKey);
							let blockchain = new BC.Blockchain();
							blockchain.chain = JSON.parse(res);
							// let newBlock = new BC.Block(req.body.index, req.body.timestamp, req.body.data);
							let newBlock = new BC.Block(req.body.index, req.body.timestamp, JSON.stringify(blockDataPreview));
							blockchain.addBlock(newBlock)
							// console.log("view blockchain:\n"+res.toString());
							await contract.submitTransaction('WriteBlockchainByKey', JSON.stringify(blockchain), req.body.ontologyKey);
							await contract.submitTransaction('WriteLatestBlockByKey', JSON.stringify(blockchain.getLatestBlock()), req.body.ontologyKey, JSON.stringify(allRepos));
							await contract.submitTransaction('FinishNewBlockRequest', req.body.ontologyKey);
							res = 'Successfully generated a new block!'
							console.log(`SUCCESS app generateBlock: ${res}`)
							result = {"success":res.toString()};
							break;
						} catch (error) {
							console.log(`FAILED ${i} app generateBlock: ${error}`);
							result = {"error":error.toString()}
						}
					}
					NewBlockLock = !NewBlockLock;
					res.json(result);
				}
			});
			app.post("/tokens", async (req, res) => {
				//Get the tokens for member1
				console.log('membersId from frontend: '+ req.body.id);
				let result;
				if(req.body.id!=='visitor'){
					for(let i=0;i<retry_cnt;i++){
						try {
							let res = await contract.submitTransaction('CheckTokens', req.body.id);
							console.log(`SUCCESS app tokens: ${res}`);
							result = {"success":JSON.parse(res)};
							break;
						} catch (error) {
							console.log(`FAILED ${i} app tokens: ${error}`);
							result = {"error":error.toString()};
						}
					}
				}
				else{
					result = {"success":"please login"};
				}
				res.json(result);
			});
			// For submitTransaction, the transaction will be sent to both peers and if both peers endorse the transaction, the endorsed proposal will be sent
			// to the orderer to be committed by each of the peer's to the channel ledger.
			app.post("/createProposal", async (req, res) => {
				if(!NewProposalLock){
					res.json({"success":`please wait`});
				}
				else{
					NewProposalLock = !NewProposalLock;
					console.log('\n--> Submit Transaction: CreatedProposal');
					let message = '';
					console.log('author: '+req.body.author)
					let result;
					for(let i=0;i<retry_cnt;i++){
						try {
							let penalization = await contract.submitTransaction('CheckInactivity', req.body.author);
							if(penalization != 0) {
								message = 'Penalization for inactivity: ' + penalization.toString() + ' tokens removed.\n';
								console.log(message);
							}

							let res = await contract.submitTransaction('CreateProposal', req.body.layer, req.body.ontology, req.body.domain, req.body.uri, req.body.author, req.body.message, req.body.type, req.body.originalID, req.body.download);
							console.log('******The creation result is:' + res);
							if (message != '') res += message + '\n';
							console.log(`SUCCESS app createProposal: ${res}`);
							result = {"success":res.toString()};
							break;
						} catch (error) {
							console.log(`FAILED ${i} app createProposal: ${error}`);
							result = {"error":error.toString()};
						}
					}
					NewProposalLock = !NewProposalLock;
					res.json(result);
				}
			});
			app.post("/validateProposal", async (req, res) => {
				if(!VaidateProposalLock){
					res.json({"success":`please wait`});
				}
				else{
					VaidateProposalLock = !VaidateProposalLock;
					let result;
					let message = '';
					for(let i=0;i<retry_cnt;i++){
						try {
							let penalization = await contract.submitTransaction('CheckInactivity', req.body.author_ID);
							if(penalization != 0) {
								message = 'Penalization for inactivity: ' + penalization.toString() + ' tokens removed.\n';
								console.log(message);
							} 
							
							let res = await contract.submitTransaction('ValidateProposal', req.body.prop_ID, req.body.author_ID, req.body.vote, req.body.messages);
							res = JSON.parse(res.toString());
							console.log(res.Message);

							if (res.Finished === true) {
								let endProposalResult = await contract.submitTransaction('EndProposal', res.ProposalID, res.Result);
								console.log(endProposalResult.toString());

								let checkLobeOwnerResult = await contract.submitTransaction('CheckNewLobOwner');
								console.log(checkLobeOwnerResult.toString());
							}

							res.Message = message + res.Message;
							console.log(`SUCCESS app validateProposal: ${JSON.stringify(res)}`);
							result = {"success":res};
							break;
						} catch (error) {
							console.log(`FAILED ${i} app validateProposal: ${error}`);
							// result.Message = error;
							result = {"error":error.toString()};
						}
					}
					VaidateProposalLock = !VaidateProposalLock;
					res.json(result);
				}
			});
			app.get("/ongoingProp", async (req, res) => {
				let result;
				for(let i=0;i<retry_cnt;i++){
					try {
						let res = await contract.evaluateTransaction('GetOngoingProposal');
						console.log(`SUCCESS app ongoingProp: ${res}`);
						
						result = {"success":JSON.parse(res)};
						break;
					} catch (error) {
						console.log(`FAILED ${i} app ongoingProp: ${error}`);
						result = {"error":error.toString()};
					}
				}
				res.json(result);
			});
			app.get("/allOngoingProp", async (req, res) => {
				let result;
				for(let i=0;i<retry_cnt;i++){
					try {
						let res = await contract.evaluateTransaction('GetAllOngoingProposal');
						console.log(`SUCCESS app allOngoingProp: ${res}`);
						
						result = {"success":JSON.parse(res)};
						break;
					} catch (error) {
						console.log(`FAILED ${i} app allOngoingProp: ${error}`);
						result = {"error":error.toString()};
					}
				}
				res.json(result);
			});
			
			app.get("/checkUpload", async (req, res) => {
				let result;
				for(let i=0;i<retry_cnt;i++){
					try {
						let res = await contract.evaluateTransaction('DRUpload_Available');
						console.log(`SUCCESS app checkUpload: ${res}`);
						result = {"success":res.toString()};
						break;
					} catch (error) {
						console.log(`FAILED ${i} app checkUpload: ${error}`);
						result = {"error":error.toString()};
					}
				}
				res.json(result);
				// console.log("The DRUpload is visible*********"+ result.toString());
			});
			
			// app.post("/downloadDecryptedDR", async (req, res) =>{
			// 	let result = await contract.evaluateTransaction('GetSymmetricKey');
			// 	cryptoMaterials = JSON.parse(result);
			// 	let symmetricKey = cryptoMaterials.symmetricKey;
			// 	let IV = cryptoMaterials.IV;
			// 	let hashStr = "";
			// 	let getPath = "./";
			// 	ipfs.get(hashStr,async (err,result)=>{
			// 		if(err) throw err;
			// 		// console.log(result);  //注意：调用get方法时回调函数中的参数是一个数组形式 内容在content中
			// 		// fs.writeFileSync(getPath, result[0].content);
			// 		// console.log('file: ' + getPath);
			// 		// console.log('从ipfs中下载文件成功!')
			// 		//写入文件
			// 		let encryptedData = result[0].content.toString();
			// 		const decipher = crypto.createDecipheriv(algorithm, symmetricKey, IV);
			// 		let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
			// 		decryptedData += decipher.final("utf8");
			// 		fs.writeFile('./fromIPFS.txt', decryptedData)
			// 	})
			// })
			// login: search by member ID, return name and role
			app.post("/memberInfo", async (req, res) => {
				//Get the amount of members in the system
				console.log(JSON.stringify(req.body));
				let result;
				for(let i=0;i<retry_cnt;i++){
					try {
						let res = await contract.evaluateTransaction('GetMemberById', req.body.memberID);
						console.log(`SUCCESS app memberInfo: ${res}`);
						result = {"success":JSON.parse(res)};
						break;
					} catch (error) {
						console.log(`FAILED ${i} app memberInfo: ${error}`);
						result = {"error":error.toString()};
					}
				}
				res.json(result);
			});

			// check blockchain
			app.get("/checkBlockchain", async (req, res) => {
				let result = await contract.evaluateTransaction('GetBlockchain');
				res.json(result.toString());
				// console.log("view blockchain:\n"+result.toString());
			});
			app.get("/checkLatestBlock", async (req, res) => {
				let result;
				for(let i=0;i<retry_cnt;i++){
					try {
						let res = await contract.evaluateTransaction('GetLatestBlock');
						console.log(`SUCCESS app checkLatestBlock: ${res}`);
						result = {"success":res.toString()}
						break;
					} catch (error) {
						console.log(`FAILED ${i} app checkLatestBlock: ${error}`);
						result = {"error":error.toString()};
					}
				}
				res.json(result);
				// console.log("view latest block:\n"+ result.toString());
			});
			app.get("/checkAllLatestBlocks", async (req, res) => {
				let result;
				for(let i=0;i<retry_cnt;i++){
					try {
						let res = await contract.evaluateTransaction('GetAllLatestBlocks');
						console.log(`SUCCESS app checkAllLatestBlocks: ${res}`);
						result = {"success":res.toString()}
						break;
					} catch (error) {
						console.log(`FAILED ${i} app checkAllLatestBlocks: ${error}`);
						result = {"error":error.toString()};
					}
				}
				res.json(result);
				// console.log("view latest block:\n"+ result.toString());
			});
			app.post("/updateDR", async (req, res) => {
				let result;
				for(let i=0;i<retry_cnt;i++){
					try {
						console.log(`app updateDR ${req.body.DR} ${req.body.Hash}`)
						await contract.submitTransaction('UpdateDRfromGithub', req.body.DR, req.body.Hash);
						let resp = `LatestDR and fileHash updated, time: ${Date()}`;
						console.log(`SUCCESS app updateDR: ${resp}`)
						result = {"success":resp};
						break;
					} catch (error) {
						let resp = error;
						result = {"error":error.toString()}
						console.log(`FAILED ${i} app updateDR, time: ${Date()}, ${resp}`)
					}
				}
				res.json(result);
			})
			app.get("/checkAllLobeOwners", async (req, res) => {
				let result = await contract.evaluateTransaction('GetAllLobeOwners');
				res.json(result.toString());
				console.log("view all lobe owners:\n"+ result.toString());
			});
			app.get("/checkMembersInDomain", async (req, res) => {
				let result = await contract.evaluateTransaction('GetMembersInDomain');
				res.json(result.toString());
				console.log("view members in domains:\n"+ result.toString());
			});
			// (temporary) load/save the domains for frontend
			app.get("/loadDomainsInFrontend", async (req, res) => {
				console.log("app load domain");
				// let fileContents = fs.readFileSync('../../../Frontend/src/config.json', 'utf8');
				// console.log(fileContents);
				// let allDomains =JSON.parse(fileContents)["allDomains"];
				console.log(allDomains);
				res.json(JSON.stringify(allDomains));
			})
			app.post("/saveDomainsInFrontend", async (req, res) => {
				console.log("app save domain");
				// fs.writeFileSync('../../../Frontend/src/config.json', JSON.stringify(req.body), 'utf8');
				allDomains = req.body["allDomains"];
				res.json('done');
			})
			async function parseFile(req) {
				console.log('In the ParseFile!');
				var RequireFile = null;
				// req.pipe(req.busboy);
				// req.busboy.on('file', async function(fieldname, file, filename) {
				// 	console.log('FileName:'+ filename);
				// 	file.on('data', async function (data) {
				// 			RequireFile = await data;
				// 			console.log('RequireFile:' + RequireFile);
				// 		}
				// 	);
				// });

				var bb = busboy({ headers: req.headers });
				bb.on('file', function(fieldname, file, filename, encoding, mimetype) {
					console.log('FileName:'+ filename.filename);
					file.on('data', async function (data) {
						RequireFile = await data;
						console.log('RequireFile:' + RequireFile);
						return RequireFile;
					});
				});
				req.pipe(bb);
				// await sleep(2000);
				// console.log('RequireFile2:' + RequireFile);
				
			}
			app.post("/ipfs", async (req, res) => {
				console.log("***********In the database API *****");
				const ipfsAPI = require('ipfs-api');
				const ipfs = ipfsAPI({host: 'localhost', port: '5001', protocol: 'http'});

				console.log('In the ParseFile ipfs!');
				var RequireFile = null;
				var FileName = null;

				var bb = busboy({ headers: req.headers });
				req.pipe(bb);
				bb.on('file', async function(fieldname, file, filename, encoding, mimetype){
					FileName = filename.filename;
					console.log('FileName:'+ FileName);
					file.on('data', async function (data) {
						if (RequireFile === null) {
							RequireFile = data;
						} else {
							RequireFile = Buffer.concat([RequireFile, data]);
						}
					});
					file.on('end', async function() {
						// let result = JSON.parse(await contract.evaluateTransaction('GetSymmetricKey'));
						// console.log(result);
						// let data = Buffer.from(result.data);
						// let cryptoMaterials = JSON.parse(data.toString());
						
						// let symmetricKey = Buffer.from(cryptoMaterials.symmetricKey,'hex');
						// let IV = Buffer.from(cryptoMaterials.IV,'hex');
						// let symmetricKey = Buffer.from("b0d2aad9db0ce0b379600225538c5642a793da7888e0e2e7559c8c64455cc322", 'hex');
						// let IV = Buffer.from("55fac4a1e8cdcd52456ba2f7d1b297db", 'hex');
						// console.log(symmetricKey);
						// console.log(IV);
						// console.log('RFile: ' + RequireFile);
						// var fileContent = Buffer.from(RequireFile, "utf-8");
						var fileContent = RequireFile;
						console.log("file size: "+fileContent.length)
						// const cipher = crypto.createCipheriv(algorithm, symmetricKey, IV);
						// var fileContentEncrypted = cipher.update(fileContent, "utf-8", "hex");
						// fileContentEncrypted += cipher.final("hex");
						// fs.writeFileSync("../../../test/temp.txt",fileContentEncrypted)
						// fileContentEncrypted = fileContent;
						// console.log(fileContentEncrypted);
						// var buff = {
						// 	path: FileName,
						// 	content: Buffer.from(fileContentEncrypted)
						// }

						// ipfs temporarily not available
						var hash = `fake link: ipfs not available`;
						console.log("new uploaded file: "+hash);
						await contract.submitTransaction('AddHash', hash);
						res.json(hash);
						// ipfs.add(buff, async (err,result)=>{
						// 	if(err) throw err;
						// 	console.log(result);
						// 	var hash = `http://127.0.0.1:8080/ipfs/${result[0].hash}?filename=${result[0].path}`;
						// 	console.log("new uploaded file: "+hash);
						// 	await contract.submitTransaction('AddHash', hash);
						// 	res.json(hash);
						// });
					})
				});
			});
			app.get("/ontologyInfo", async (req, res) => {
				console.log("app ontologyInfo");
				// multiple layers can be added
				let result = {
					Name: ontologyName,
					Domains: allDomains
				};
				res.json(JSON.stringify(result));
			})
		} finally {
			// Disconnect from the gateway when the application is closing
			// This will close all connections to the network
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
}

main();
app.listen(3001, async () => {
	console.log("Backend server running on port 3001.");
});
