import React, { Component } from 'react';
import { Card, CardContent, Grid, Typography, Divider } from '@material-ui/core';

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
    try{
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
    }
    catch(error){
      // alert(error);
    } 
  };
  getLatestBlock = async () => {
    try{
      let latestBlock = await fetch('http://localhost:3001/checkLatestBlock').then((response) => response.json());
      if(!latestBlock.error){
        latestBlock = JSON.parse(latestBlock.success);
        if(latestBlock.data.includes('UpdatedVersion'))
          latestBlock.data = JSON.parse(latestBlock.data);
        this.setState({
          latestBlock: latestBlock,
        }, console.log(latestBlock));
      }
      else{
        alert(latestBlock.error);
      }
    }
    catch(error){
      // alert(error);
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
                lobe owner: {this.state.newBlockReq?.lobeOwner}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}
export default BlockInfo;
