import React, { Component } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
  TextField,
  Input,
  Button
} from '@material-ui/core';
import useToken from 'src/useToken';
import { Navigate } from 'react-router';
import NavItem from 'src/layouts/DashboardLayout/NavBar/NavItem';

export default class GenerateBlock extends Component {
  constructor() {
    super();
    this.state = {
      latestBlock: null,
      nextIndex: 0,
      nextTimestamp: '',
      nextCommitHash: '',
      commitMessage: '', 
      Redirect: '',
      newBlockReq: '',
      Repo: null,
      allNewBlockReq: {},
      allLatestBlocks: {},
      AllRepos: {},
      allNewBlocks: {},
      ontologyKey: '',
      timestamp:'',
      blockDataPreview: null,
    }
  }

  componentDidMount() {
    // this.getNewBlockRequest();
    this.getAllNewBlockRequests();
    // this.getCommitInfo();
    // if(sessionStorage.getItem('latestBlock')===null)
    // this.getLatestBlock();
    // this.getTimeStamp();
    this.getAllLatestBlocks();
    this.getAllCommitInfo();
  }
  getNewBlockRequest = async () => {
    let token = sessionStorage.getItem('token');
    if(token===null){
      this.setState({
        Redirect:'Login'
      })
      alert('Please login in!');
      return;
    }
    token = JSON.parse(token);
    let newBlockReq = await fetch('http://localhost:3001/checkNewBlockRequest').then((response) => response.json());
    // newBlockReq = JSON.parse(newBlockReq);
    if(newBlockReq.error){
      alert(newBlockReq.error)
      return;
    }
    
    newBlockReq = newBlockReq.success;
    // alert(JSON.stringify(newBlockReq))
    // alert(newBlockReq.newBlockWaiting)
    if(newBlockReq.newBlockWaiting==='true'){
      if(newBlockReq.author!==token.ID&&newBlockReq.lobeOwner!==token.ID){
        alert('A new block is to be generated: waiting for lobe owner operation!');
        this.setState({
          Redirect:'Dashboard'
        })
        return;
      }
      else{
        this.setState({
          newBlockReq:newBlockReq
        })
      }
    }
    else{
      alert('No new block waiting!');
      this.setState({
        Redirect:'Dashboard'
      })
      return;
    }
  };
  getAllNewBlockRequests = async () => {
    let token = sessionStorage.getItem('token');
    if(token===null){
      this.setState({
        Redirect:'Login'
      })
      alert('Please login in!');
      return;
    }
    token = JSON.parse(token);
    let allNewBlockReq = await fetch('http://localhost:3001/checkAllNewBlockRequests').then((response) => response.json());
    // newBlockReq = JSON.parse(newBlockReq);
    if(allNewBlockReq.error){
      alert(allNewBlockReq.error)
      return;
    }
    
    allNewBlockReq = allNewBlockReq.success;
    // alert(JSON.stringify(newBlockReq))
    // alert(newBlockReq.newBlockWaiting)
    if(Object.keys(allNewBlockReq).length>0){
      this.setState({
        allNewBlockReq:allNewBlockReq
      })
      
    }
    else{
      alert('No new block waiting!');
      this.setState({
        Redirect:'Dashboard'
      })
      return;
    }
  };
  getLatestBlock = async () => {
    let latestBlock = await fetch('http://localhost:3001/checkLatestBlock').then((response) => response.json());
    // latestBlock = JSON.parse(latestBlock)
    if(latestBlock.error){
      alert(latestBlock.error)
      return;
    }
    latestBlock = JSON.parse(latestBlock.success);
    this.setState({
      latestBlock: latestBlock,
    }, console.log(latestBlock.index));
    this.setState({
      nextIndex:latestBlock.index+1
    })
  };
  getAllLatestBlocks = async () => {
    const allLatestBlocks = await fetch('http://localhost:3001/checkAllLatestBlocks').then((response) => response.json());
    if(!allLatestBlocks.error){
      this.setState({
        allLatestBlocks: JSON.parse(allLatestBlocks.success),
      }, console.log(allLatestBlocks));
    }
    else{
      alert(allLatestBlocks.error);
    }
  };
  getAllCommitInfo = async() => {
    const AllRepos = await fetch('http://localhost:3001/AllRepos').then((response) => response.json());
    if(!AllRepos.error){
      this.setState({
        AllRepos: AllRepos.success,
      }, console.log(AllRepos));
      // using GitHub api to get commit infod
      var link = '';
      var prefix = '';

      for(let ontologyKey in this.state.AllRepos){
        // alert(`ontologyKey: ${ontologyKey}`)
        let Platform = this.state.AllRepos[ontologyKey].Platform;
        let RepoName = this.state.AllRepos[ontologyKey].Repo;
        let DefaultBranch = this.state.AllRepos[ontologyKey].Default;
        let AccessToken = this.state.AllRepos[ontologyKey].AccessToken;
      
        if(Platform==='GitHub'){
          link = `https://api.github.com/repos/${RepoName}/commits/${DefaultBranch}`;
          prefix = `https://github.com/${RepoName}/commit/`;
        }
        else{
          // '/' in author/repo needs to be replaced with %2F
          let rp_part = RepoName.split('/');
          let rp = rp_part[0];
          for(let i=1;i<rp_part.length;i++){
            rp += '%2F' + rp_part[i];
          }
          link = `https://gitlab.intra.infineon.com/api/v4/projects/${rp}/repository/commits/${DefaultBranch}`;
          // prefix = `https://gitlab.intra.infineon.com/api/v4/projects/${rp}/repository/commits/`;
          prefix = `https://gitlab.intra.infineon.com/${RepoName}/-/commit/`
        }
        // alert(`link: ${link}`)
        await fetch(link, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                "PRIVATE-TOKEN": AccessToken,
              },
            //   body: JSON.stringify(data)
            }).then(function(resp){
                // console.log(resp.json());
                return resp.json();
            }).then((body)=>{
              if(Platform==='GitHub'){
                console.log(body.sha)
                console.log(body.commit.message)
                console.log(body.commit.author.date)
                this.getTimeStamp(body.commit.author.date);
                let newBlock = {
                  timestamp: this.state.timestamp,
                  data: prefix+body.sha,
                  commitMessage: body.commit.message,
                }
                // alert(`newBlock: ${newBlock}`)
                let allNewBlocks = this.state.allNewBlocks;
                allNewBlocks[ontologyKey] = newBlock;
                this.setState({
                  allNewBlocks:allNewBlocks,
                })
                this.setState({
                  nextCommitHash: prefix+body.sha,
                  // nextTimestamp:'',
                  commitMessage: body.commit.message
                })
              }
              else{
                console.log(body.id)
                console.log(body.message)
                console.log(body.committed_date)
                this.getTimeStamp(body.committed_date);
                let newBlock = {
                  timestamp: this.state.timestamp,
                  data: prefix+body.id,
                  commitMessage: body.message,
                }
                let allNewBlocks = this.state.allNewBlocks;
                allNewBlocks[ontologyKey] = newBlock;
                this.setState({
                  allNewBlocks:allNewBlocks,
                })
                this.setState({
                  nextCommitHash: prefix+body.id,
                  // nextTimestamp:',',
                  commitMessage: body.message
                })
              }  
        })
      }
    }
    else{
      alert(AllRepos.error);
    }
  }
  getCommitInfo = async() => {
    const Repo = await fetch('http://localhost:3001/Repo').then((response) => response.json());
    if(!Repo.error){
      this.setState({
        Repo: Repo.success,
      }, console.log(Repo));
      // using GitHub api to get commit info
      var link = '';
      var prefix = '';
      if(this.state.Repo.Platform==='GitHub'){
        link = `https://api.github.com/repos/${this.state.Repo.RepoName}/commits/${this.state.Repo.DefaultBranch}`;
        prefix = `https://github.com/${this.state.Repo.RepoName}/commit/`;
      }
      else{
        // '/' in author/repo needs to be replaced with %2F
        let rp_part = this.state.Repo.RepoName.split('/');
        let rp = rp_part[0];
        for(let i=1;i<rp_part.length;i++){
          rp += '%2F' + rp_part[i];
        }
        link = `https://gitlab.intra.infineon.com/api/v4/projects/${rp}/repository/commits/${this.state.Repo.DefaultBranch}`;
        // prefix = `https://gitlab.intra.infineon.com/api/v4/projects/${rp}/repository/commits/`;
        prefix = `https://gitlab.intra.infineon.com/${this.state.Repo.RepoName}/-/commit/`
      }
      fetch(link, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              "PRIVATE-TOKEN":this.state.Repo.AccessToken,
            },
          //   body: JSON.stringify(data)
          }).then(function(resp){
              // console.log(resp.json());
              return resp.json();
          }).then((body)=>{
            if(this.state.Repo.Platform==='GitHub'){
              console.log(body.sha)
              console.log(body.commit.message)
              console.log(body.commit.author.date)
              this.getTimeStamp(body.commit.author.date);
              this.setState({
                nextCommitHash: prefix+body.sha,
                // nextTimestamp:'',
                commitMessage: body.commit.message
              })
            }
            else{
              console.log(body.id)
              console.log(body.message)
              console.log(body.committed_date)
              this.getTimeStamp(body.committed_date);
              this.setState({
                nextCommitHash: prefix+body.id,
                // nextTimestamp:',',
                commitMessage: body.message
              })
            }  
      })
    }
    else{
      alert(Repo.error);
    }
  }
  getTimeStamp = async (t) => {
    let d = new Date(t);
    let date, month, year, hh, mm;
    if(d.getDate()<10)
      date = '0' + d.getDate();
    else
      date = d.getDate();
    if(d.getMonth()+1<10)
      month = '0' + (d.getMonth()+1).toString();
    else
      month = d.getMonth()+1;
    year = d.getFullYear();
    if(d.getHours()<10)
      hh = '0' + d.getHours();
    else
      hh = d.getHours();
    if(d.getMinutes()<10)
      mm = '0' + d.getMinutes();
    else
      mm = d.getMinutes();
    const timestamp = `${date}.${month}.${year} ${hh}:${mm} (CET)`;
    this.setState({
      timestamp:timestamp
    }, console.log('timestamp: '+timestamp));
    // return timestamp;
  };
  handleChangeB = async (event) => {
    let value = Array.from(event.target.selectedOptions, option => option.value)
    let ontologyKey = value[0];
    if(ontologyKey.length===0)
      return;
    // alert(`ontologyKey: ${ontologyKey}`)
    let latestBlock = this.state.allLatestBlocks[ontologyKey];
    let newBlock = this.state.allNewBlocks[ontologyKey]
    // alert(JSON.stringify(newBlock))
    this.setState({
      ontologyKey: ontologyKey,
      latestBlock: latestBlock,
      nextIndex: latestBlock.index+1,
      nextTimestamp: newBlock.timestamp,
      nextCommitHash: newBlock.data,
    });
  };
  handleSubmit = async(event) => {
    // if(this.state.newBlockReq!=='true'){
    //   alert('No new block request now!');
    //   return;
    // }
    event.preventDefault();
    // let newBlockReq = await fetch('http://localhost:3001/checkNewBlockRequest').then((response) => response.json());
    // // newBlockReq = JSON.parse(newBlockReq);
    // if(newBlockReq.error){
    //   alert(newBlockReq.error)
    //   return;
    // }
    // newBlockReq = newBlockReq.success;
    // if(newBlockReq.newBlockWaiting!=='true'){
    //   alert('No new block waiting!');
    //   this.setState({
    //     Redirect:'Dashboard'
    //   })
    //   return;
    // }
    let token = sessionStorage.getItem('token');
    if(token===null){
      this.setState({
        Redirect:'Login'
      })
      alert('Please login in!');
      return;
    }
    token = JSON.parse(token);
    
    // let latestBlock = this.state.latestBlock;
    // let timestamp = this.state.[this.state.ontologyKey];
    // let nextCommitHash = this.all
    let NBReq = this.state.allNewBlockReq[this.state.ontologyKey]
    const data = {
      proposalID: NBReq.proposalID,
      ontologyKey: this.state.ontologyKey,
      index: this.state.nextIndex,
      // timestamp: this.state.allNewBlocks[this.state.ontologyKey].timestamp,
      // data: this.state.allNewBlocks[this.state.ontologyKey].data,
      timestamp: this.state.nextTimestamp,
      data: this.state.nextCommitHash,
    }
    if(data.data===this.state.latestBlock.data){
      alert('New branch is to be merged before block generation!');
      return;
    }
    // const link = 'https://api.github.com/repos/tibonto/dr/commits/master';
    // const prefix = 'https://github.com/tibonto/dr/commit/';


    console.log('****Generate new block invokes generateBlock api*********');
    const retry_cnt = 3;
    for(let i=0;i<retry_cnt;i++){
      let result = await fetch('http://localhost:3001/generateBlock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }).then((response) =>response.json());
      // alert(JSON.stringify(result));
      if(!result.error){
        // alert(result.success);
        if(result.success!=='please wait'){
          this.setState({
            Redirect: "Dashboard"
          })
        }
        return;
      }
      else{
        // if error, check if the block is "somehow" added
        // alert(result.error)
        alert("checking & retrying ...")
        let latestBlock = await fetch('http://localhost:3001/checkLatestBlock').then((response) => response.json());
        // latestBlock = JSON.parse(latestBlock)
        if(latestBlock.error){
          alert(latestBlock.error)
          return;
        }
        latestBlock = JSON.parse(latestBlock.success);
        if(data.index===latestBlock.index){
          alert('New block added');
          this.setState({
            Redirect: "Dashboard"
          })
          return;
        }
      }
      // await fetch('http://localhost:3001/generateBlock', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(data)
      // }).then(function(response){
      //   // alert(response);
      //   // let body = response.json();
      //   // alert(body);
      //   // return body;
      //   return response.json();
      // }).then((body)=>{
      //   if(body.error){
      //     alert(body.error)
      //     this.setState({
      //       Redirect:'Dashboard'
      //     });
      //   }
      //   else{
      //     alert(body.success)
      //     console.log(body);
      //     if(body!=='please wait')
      //       this.setState({
      //         Redirect:'Dashboard'
      //       });
      //   }
      // });
    }
  }
  render()
    {
      if(this.state.Redirect==='Login'){
        return <Navigate to='/app/login' state={this.state}></Navigate>
      }
      if(this.state.Redirect==='Dashboard'){
        return <Navigate to='/app/dashboard' state={this.state}></Navigate>
      }
      return (
        <form onSubmit={this.handleSubmit} >
          <Card>
            <CardHeader
              title="Current latest block"
            />
            <CardContent>
              <Grid>
              <select value={this.state.ontologyKey} onChange={this.handleChangeB}>
                  <option></option>
              {
                Object.keys(this.state.allNewBlockReq).map(ontologyKey => {
                  return <option key={ontologyKey} value={ontologyKey}>{ontologyKey}</option>
                })
              }
              </select>
                <Typography
                    color="textPrimary"
                    gutterBottom
                    variant="h6"
                  >
                    index: {this.state.latestBlock?this.state.latestBlock.index:-1}
                </Typography>
                <Typography
                    color="textPrimary"
                    gutterBottom
                    variant="h6"
                  >
                    timestamp: {this.state.latestBlock?this.state.latestBlock.timestamp:'n/a'}
                </Typography>
                <Typography
                    color="textPrimary"
                    gutterBottom
                    variant="h6"
                  >
                    data: {this.state.latestBlock?this.state.latestBlock.data:'n/a'} <button><a href={this.state.latestBlock?this.state.latestBlock.data:'n/a'} target={"_blank"} rel={"noopener noreferrer"}>check</a></button>
                </Typography>
                <Typography
                    color="textPrimary"
                    gutterBottom
                    variant="h6"
                  >
                    previousHash: {this.state.latestBlock?this.state.latestBlock.previousHash:'n/a'}
                </Typography>
                <Typography
                    color="textPrimary"
                    gutterBottom
                    variant="h6"
                  >
                    hash: {this.state.latestBlock?this.state.latestBlock.hash:'n/a'}
                </Typography>
              </Grid>
            </CardContent>
          </Card>
          <Card>
            <CardHeader
              title="Generate a new block"
            />
            <CardContent>
              {/* <Grid
                container
                spacing={10}
                wrap="wrap"
              >
                <Grid
                  item
                  md={4}
                  sm={6}
                  xs={12}
                >
                  <Typography
                    color="textPrimary"
                    gutterBottom
                    variant="h6"
                  >
                    Knowledge Domain
                  </Typography>
                </Grid>
              </Grid> */}
                <Typography
                    color="textPrimary"
                    gutterBottom
                    variant="h6"
                  >
                    index: {this.state.ontologyKey.length>0?this.state.nextIndex:-1}
                </Typography>
                <Typography
                    color="textPrimary"
                    gutterBottom
                    variant="h6"
                  >
                    timestamp: {this.state.ontologyKey.length>0?this.state.nextTimestamp:'n/a'}
                </Typography>
                <Typography
                    color="textPrimary"
                    gutterBottom
                    variant="h6"
                  >
                    data: {this.state.ontologyKey.length>0?this.state.nextCommitHash:'n/a'} <button><a href={this.state.ontologyKey.length>0?this.state.nextCommitHash:'n/a'} target={"_blank"} rel={"noopener noreferrer"}>check</a></button>
                </Typography>
                <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="h6"
                  >
                    commitMessage: {this.state.ontologyKey.length>0?this.state.commitMessage:'n/a'}
                </Typography>
            </CardContent>
            <Divider />
            <Button variant="contained" color="primary">
              <Input style={{color: "white"}} type="submit" value="Submit"/>
            </Button>

          </Card>
        </form>
      );
    }
}
