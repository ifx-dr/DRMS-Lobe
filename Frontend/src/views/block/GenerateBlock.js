import React, { Component } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
  Input,
  Button
} from '@material-ui/core';
import { Navigate } from 'react-router';

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
      BlockDataPreview: null
    }
  }

  componentDidMount() {
    this.getNewBlockRequest();
    this.getLatestBlock();
  }
  getNewBlockRequest = async () => {
    try{
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
          this.getCommitInfo();
        }
      }
      else{
        alert('No new block waiting!');
        this.setState({
          Redirect:'Dashboard'
        })
        return;
      }
    }
    catch{}
  };
  getLatestBlock = async () => {
    try{
      let latestBlock = await fetch('http://localhost:3001/checkLatestBlock').then((response) => response.json());
      // latestBlock = JSON.parse(latestBlock)
      if(latestBlock.error){
        alert(latestBlock.error)
        return;
      }
      latestBlock = JSON.parse(latestBlock.success);
      if(latestBlock.data.includes('UpdatedVersion'))
        latestBlock.data = JSON.parse(latestBlock.data);
      this.setState({
        latestBlock: latestBlock,
      }, console.log(latestBlock.index));
      this.setState({
        nextIndex:latestBlock.index+1
      })
    }
    catch{}
  };
  getCommitInfo = async() => {
    try{
      const Repo = await fetch('http://localhost:3001/Repo').then((response) => response.json());
      if(!Repo.error){
        this.setState({
          Repo: Repo.success,
        }, console.log(Repo));
        // alert(JSON.stringify(this.state.Repo))
        // using GitHub api to get commit info
        var link = '';
        var prefix = '';
        if(this.state.Repo===null)
          return;
        if(this.state.Repo.Platform==='GitHub'){
          link = `https://api.github.com/repos/${this.state.Repo.RepoName}/commits/${this.state.Repo.DefaultBranch}`;
          prefix = `https://github.com/${this.state.Repo.RepoName}/commit/`;
        }
        else{
          // '/' in author/repo needs to be replaced with %2F
          let reponame_split = this.state.Repo.RepoName.split('/');
          let rp = reponame_split[0];
          for(let i=1;i<reponame_split.length;i++)
            rp += '%2F' + reponame_split[i]
          
          link = `https://gitlab.intra.infineon.com/api/v4/projects/${rp}/repository/commits/${this.state.Repo.DefaultBranch}`;
          // prefix = `https://gitlab.intra.infineon.com/api/v4/projects/${rp}/repository/commits/`;
          prefix = `https://gitlab.intra.infineon.com/${this.state.Repo.RepoName}/-/commit/`
        }
        // alert(link)
        let headers;
        if(this.state.Repo.Platform==='GitHub'){
          headers = {
            'Content-Type': 'application/json',
          }
        }
        else{
          headers = {
            'Content-Type': 'application/json',
            "PRIVATE-TOKEN":this.state.Repo.AccessToken,
          }
        }
        fetch(link, {
              method: 'GET',
              headers: headers,
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
        }).then(()=>{
          let data = {
            proposalID: this.state.newBlockReq.proposalID,
            data: this.state.nextCommitHash,
            message: this.state.commitMessage
          };
          // alert(JSON.stringify(data))
          fetch('http://localhost:3001/getBlockDataPreview',{
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
              }).then((response) => response.json())
              .then((body)=>{
                this.setState({
                  BlockDataPreview: body.success
                })
              });  
        });
      }
      else{
        alert(Repo.error);
      }
    }
    catch{}
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
    this.setState({
      nextTimestamp:timestamp
    }, console.log('timestamp: '+timestamp));
  };

  handleSubmit = async(event) => {
    // if(this.state.newBlockReq!=='true'){
    //   alert('No new block request now!');
    //   return;
    // }
    event.preventDefault();
    let newBlockReq = await fetch('http://localhost:3001/checkNewBlockRequest').then((response) => response.json());
    // newBlockReq = JSON.parse(newBlockReq);
    if(newBlockReq.error){
      alert(newBlockReq.error)
      return;
    }
    newBlockReq = newBlockReq.success;
    if(newBlockReq.newBlockWaiting!=='true'){
      alert('No new block waiting!');
      this.setState({
        Redirect:'Dashboard'
      })
      return;
    }
    let token = sessionStorage.getItem('token');
    if(token===null){
      this.setState({
        Redirect:'Login'
      })
      alert('Please login in!');
      return;
    }
    token = JSON.parse(token);
    
    const data = {
      index: this.state.nextIndex,
      timestamp: this.state.nextTimestamp,
      data: this.state.nextCommitHash,
      proposalID: newBlockReq.proposalID
    }
    if(this.state.latestBlock.data.UpdatedVersion){
      if(data.data===this.state.latestBlock.data.UpdatedVersion){
        alert('New branch is to be merged before block generation!');
        return;
      }
    }
    else{
      if(data.data===this.state.latestBlock.data){
        alert('New branch is to be merged before block generation!');
        return;
      }
    }
    // const link = 'https://api.github.com/repos/tibonto/dr/commits/master';
    // const prefix = 'https://github.com/tibonto/dr/commit/';


    console.log('****Generate new block invokes generateBlock api*********');
    const retry_cnt = 3;
    try{
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
          alert(result.success);
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
    catch(error){alert(error)}
  }
  render()
    {
      if(this.state.Redirect==='Login'){
        return <Navigate to='/app/login' state={this.state}></Navigate>
      }
      // if(this.state.Redirect==='Dashboard'){
      //   return <Navigate to='/app/dashboard' state={this.state}></Navigate>
      // }
      return (
        <form onSubmit={this.handleSubmit} >
          <Card>
            <CardHeader
              title="Current latest block"
            />
            <CardContent>
              <Grid>
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
                    {/* data: {this.state.latestBlock?this.state.latestBlock.data:'n/a'} <button><a href={this.state.latestBlock?this.state.latestBlock.data:'n/a'} target={"_blank"} rel={"noopener noreferrer"}>check</a></button> */}
                    {/* data: {JSON.stringify(this.state.latestBlock?this.state.latestBlock.data:'n/a')} */}
                    {/* data: {this.state.latestBlock?this.state.latestBlock.data:'n/a'} <button><a href={this.state.latestBlock?this.state.latestBlock.data:'n/a'} style={{"text-decoration":"none"}} target="_blank" rel={"noopener noreferrer"}>check</a></button> */}
                    data: {(this.state.latestBlock)&&!(this.state.latestBlock.data.ProposedVersion)&&!(this.state.latestBlock.data.UpdatedVersion)?<button><a href={this.state.latestBlock.data} style={{"text-decoration":"none"}} target="_blank" rel={"noopener noreferrer"}>check data</a></button>:''}
                {(this.state.latestBlock)&&(this.state.latestBlock.data.ProposedVersion)?<button><a href={this.state.latestBlock.data.ProposedVersion} style={{"text-decoration":"none"}} target="_blank" rel={"noopener noreferrer"}>check ProposedVersion</a></button>:''}
                {(this.state.latestBlock)&&(this.state.latestBlock.data.UpdatedVersion)?<button><a href={this.state.latestBlock.data.UpdatedVersion} style={{"text-decoration":"none"}} target="_blank" rel={"noopener noreferrer"}>check UpdatedVersion</a></button>:''}
                <p>{this.state.latestBlock?(
                  (!(this.state.latestBlock.data.ProposedVersion)&&!(this.state.latestBlock.data.UpdatedVersion))?
                  (this.state.latestBlock.data):
                  (
                    Object.keys(this.state.latestBlock.data).map((keyName, i) => (
                      <p key={i}>
                        {keyName}: {this.state.latestBlock.data[keyName]}
                      </p>
                  ))
                  )
                ):'n/a'}</p>
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
                    index: {this.state.nextIndex}
                </Typography>
                <Typography
                    color="textPrimary"
                    gutterBottom
                    variant="h6"
                  >
                    timestamp: {this.state.nextTimestamp}
                </Typography>
                <Typography
                    color="textPrimary"
                    gutterBottom
                    variant="h6"
                  >
                    {/* data: {this.state.nextCommitHash} <button><a href={this.state.nextCommitHash} target={"_blank"} rel={"noopener noreferrer"}>check</a></button> */}
                    {/* data: {JSON.stringify(this.state.BlockDataPreview)} */}
                    {/* data: {this.state.latestBlock?this.state.latestBlock.data:'n/a'} <button><a href={this.state.latestBlock?this.state.latestBlock.data:'n/a'} style={{"text-decoration":"none"}} target="_blank" rel={"noopener noreferrer"}>check</a></button> */}
                data: {(this.state.BlockDataPreview)&&!(this.state.BlockDataPreview.ProposedVersion)&&!(this.state.BlockDataPreview.UpdatedVersion)?<button><a href={this.state.BlockDataPreview} style={{"text-decoration":"none"}} target="_blank" rel={"noopener noreferrer"}>check data</a></button>:''}
                {(this.state.BlockDataPreview)&&(this.state.BlockDataPreview.ProposedVersion)?<button><a href={this.state.BlockDataPreview.ProposedVersion} style={{"text-decoration":"none"}} target="_blank" rel={"noopener noreferrer"}>check ProposedVersion</a></button>:''}
                {(this.state.BlockDataPreview)&&(this.state.BlockDataPreview.UpdatedVersion)?<button><a href={this.state.BlockDataPreview.UpdatedVersion} style={{"text-decoration":"none"}} target="_blank" rel={"noopener noreferrer"}>check UpdatedVersion</a></button>:''}
                <p>{this.state.BlockDataPreview?(
                  (!(this.state.BlockDataPreview.ProposedVersion)&&!(this.state.BlockDataPreview.UpdatedVersion))?
                  (this.state.BlockDataPreview):
                  (
                    Object.keys(this.state.BlockDataPreview).map((keyName, i) => (
                      <p key={i}>
                        {keyName}: {this.state.BlockDataPreview[keyName]}
                      </p>
                  ))
                  )
                ):'n/a'}</p>
                </Typography>
                <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="h6"
                  >
                    commitMessage: {this.state.commitMessage}
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
