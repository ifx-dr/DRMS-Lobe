import React, { Component } from 'react';
import { Avatar, Box, Button, Card, CardContent, Grid, Typography, Divider } from '@material-ui/core';

class BlockInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
        latestBlock:null,
        newBlockReq: ''
    };
  }

  componentDidMount() {
    this.getLatestBlock(); // .then(((response) => console.log(response)));
    this.getNewBlockRequest();
}

  getNewBlockRequest = async () => {
    let newBlockReq = await fetch('http://localhost:3001/checkNewBlockRequest').then((response) => response.json());
    // if(newBlockReq==='true')
    //     newBlockReq = '456';
    if(!newBlockReq.error){
      this.setState({
        newBlockReq: newBlockReq.success,
      }, console.log(newBlockReq));
    }
    else{
      alert(newBlockReq.error);
    }
    
  };
  getLatestBlock = async () => {
    const latestBlock = await fetch('http://localhost:3001/checkLatestBlock').then((response) => response.json());
    if(!latestBlock.error){
      this.setState({
        latestBlock: JSON.parse(latestBlock.success),
      }, console.log(latestBlock));
    }
    else{
      alert(latestBlock.error);
    }
    
  };

  render() {
    return (
      <Card>
        <CardContent>
          <Grid
            container
            justify="space-between"
            spacing={3}
          >
            <Grid item>
              <Typography
                color="textSecondary"
                gutterBottom
                variant="h6"
              >
                Here is the latest block: 
              </Typography>
              <Typography
                color="textPrimary"
                variant="h6"
              >
                index: {this.state.latestBlock?this.state.latestBlock.index:-1}
              </Typography>
              <Typography
                color="textPrimary"
                variant="h6"
              >
                timestamp: {this.state.latestBlock?this.state.latestBlock.timestamp:'n/a'}
              </Typography>
              <Typography
                color="textPrimary"
                variant="h6"
              >
                data: {this.state.latestBlock?this.state.latestBlock.data:'n/a'} <button><a href={this.state.latestBlock?this.state.latestBlock.data:'n/a'} style={{"text-decoration":"none"}} target="_blank" rel={"noopener noreferrer"}>check</a></button>
              </Typography>
              <Typography
                color="textPrimary"
                variant="h6"
              >
                previousHash: {this.state.latestBlock?this.state.latestBlock.previousHash:'n/a'}
              </Typography>
              <Typography
                color="textPrimary"
                variant="h6"
              >
                hash: {this.state.latestBlock?this.state.latestBlock.hash:'n/a'}
              </Typography>
              <Divider />
              <Typography
                color="textSecondary"
                gutterBottom
                variant="h6"
              >
                Do we need a new block: 
              </Typography>
              <Typography
                color="textPrimary"
                variant="h6"
              >
                newBlockWaiting: {this.state.newBlockReq?.newBlockWaiting}
              </Typography>
              <Typography
                color="textPrimary"
                variant="h6"
              >
                proposalID: {this.state.newBlockReq?.proposalID}
              </Typography>
              <Typography
                color="textPrimary"
                variant="h6"
              >
                author: {this.state.newBlockReq?.author}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}
export default BlockInfo;
