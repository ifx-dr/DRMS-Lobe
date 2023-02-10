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
import { times } from 'lodash';

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
      newBlockReq: '' 
    }
  }

  componentDidMount() {
    this.getNewBlockRequest();
    this.getCommitInfo();
    // if(sessionStorage.getItem('latestBlock')===null)
    this.getLatestBlock();
    this.getTimeStamp();
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
    // alert(JSON.stringify(newBlockReq.success))
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
  getCommitInfo = async() => {
    // using GitHub api to get commit info
    const link = 'https://api.github.com/repos/tibonto/dr/commits/master';
    const prefix = 'https://github.com/tibonto/dr/commit/';
    fetch(link, {
          method: 'GET',
        //   headers: {
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify(data)
        }).then(function(resp){
            // console.log(resp.json());
            return resp.json();
        }).then((body)=>{
            console.log(body.sha)
            console.log(body.commit.message)
            this.setState({
              nextCommitHash: prefix+body.sha,
              commitMessage: body.commit.message
            })
        })
  }
  getTimeStamp = async () => {
    let d = new Date();
    let date, month, year;
    if(d.getDate()<10)
      date = '0' + d.getDate();
    else
      date = d.getDate();
    if(d.getMonth()+1<10)
      month = '0' + (d.getMonth()+1).toString();
    else
      month = d.getMonth()+1;
    year = d.getFullYear();
    const timestamp = date + '.' + month + '.' + year;
    this.setState({
      nextTimestamp:timestamp
    }, console.log('timestamp: '+timestamp));
  };

  handleSubmit = async(event) => {
    // if(this.state.newBlockReq!=='true'){
    //   alert('No new block request now!');
    //   return;
    // }
    let token = sessionStorage.getItem('token');
    if(token==null){
      this.setState({
        Redirect:'Login'
      })
      alert('Please login in!');
      return;
    }
    token = JSON.parse(token);
    event.preventDefault();
    const data = {
      index: this.state.nextIndex,
      timestamp: this.state.nextTimestamp,
      data: this.state.nextCommitHash
    }
    // const link = 'https://api.github.com/repos/tibonto/dr/commits/master';
    // const prefix = 'https://github.com/tibonto/dr/commit/';


    console.log('****Generate new block invokes generateBlock api*********');
    await fetch('http://localhost:3001/generateBlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(function(response){
        // alert(response);
        // let body = response.json();
        // alert(body);
        // return body;
        return response.json();
      }).then((body)=>{
        if(body.error){
          alert(body.error)
          this.setState({
            Redirect:'Dashboard'
          });
        }
        else{
          alert(body.success)
          console.log(body);
          if(body!=='please wait')
            this.setState({
              Redirect:'Dashboard'
            });
        }
      });

  }
  render()
    {
      if(this.state.Redirect=='Dashboard'){
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
                    data: {this.state.latestBlock?this.state.latestBlock.data:'n/a'} <button><a href={this.state.latestBlock?this.state.latestBlock.data:'n/a'} target={"_blank"}>check</a></button>
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
                    data: {this.state.nextCommitHash} <button><a href={this.state.nextCommitHash} target={"_blank"}>check</a></button>
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
