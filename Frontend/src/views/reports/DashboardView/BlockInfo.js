import React, { Component } from 'react';
import { Avatar, Box, Button, Card, CardContent, Grid, Typography, Divider, CardHeader } from '@material-ui/core';

class BlockInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
        latestBlock:null,
        newBlockReq: '',
        allLatestBlocks: {},
        blockInfoSorted: {},
        allNewBlockReq: {},
    };
  }

  componentDidMount() {
    this.getLatestBlock(); // .then(((response) => console.log(response)));
    this.getNewBlockRequest();
    this.getAllLatestBlocks();
    this.getAllNewBlockRequests();
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
  getAllLatestBlocks = async () => {
    const allLatestBlocks = await fetch('http://localhost:3001/checkAllLatestBlocks').then((response) => response.json());
    if(!allLatestBlocks.error){
      this.setState({
        allLatestBlocks: JSON.parse(allLatestBlocks.success),
      }, console.log(allLatestBlocks));
      let blockInfoSorted = {};
      for(let ontologyKey in this.state.allLatestBlocks){
        let idx = ontologyKey.indexOf(']');
        let layerName = ontologyKey.substring(1, idx);
        let ontologyName = ontologyKey.substring(idx+2);
        if(!(layerName in blockInfoSorted))
          blockInfoSorted[layerName] = {};
        blockInfoSorted[layerName][ontologyName] = this.state.allLatestBlocks[ontologyKey];
      }
      this.setState({
        blockInfoSorted: blockInfoSorted,
      });
      alert(JSON.stringify(this.state.blockInfoSorted))
    }
    else{
      alert(allLatestBlocks.error);
    }
  };

  render() {
    return (
      <Card>
        <CardHeader
        title="Blockchain information"
        />
        <Divider />
        <CardContent>
          <Grid
            container
            justify="space-between"
            spacing={3}
          >
            <Grid item>
              {/* <Typography
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
                lobe owner: {this.state.newBlockReq?.lobeOwner}
              </Typography>
              <Divider /> */}
              <Typography
                color="textSecondary"
                gutterBottom
                variant="h6"
              >
                Ontology requesting for new block: {Object.keys(this.state.allNewBlockReq).length===0?'No new block request':''}
              </Typography>
              {
                Object.keys(this.state.allNewBlockReq).map(ontologyKey => {
                  return (<Typography
                    color="textSecondary"
                      variant="h6"
                    >
                      {`Layer: ${this.state.allNewBlockReq[ontologyKey].Layer}, Ontology: ${this.state.allNewBlockReq[ontologyKey].Ontology}, Lobe owner: ${this.state.allNewBlockReq[ontologyKey].lobeOwner}`}
                  </Typography>)
                })
              }
              {/* <Typography
                color="textPrimary"
                variant="h6"
              >
                proposalID: {this.state.newBlockReq?.proposalID} */}
              {
                // Object.keys(this.state.dict).map(name => (
                //   <Services categories={this.state.dict[name]}></Services>
                // ))
                
                Object.keys(this.state.blockInfoSorted).map(layerName => {
                    // return <option key={index} value={value}>{value}</option>
                    
                    return (
                      <Typography
                      color="textSecondary"
                        variant="h6"
                      >
                        {layerName}
                        
                        {
                          Object.keys(this.state.blockInfoSorted[layerName]).map(ontologyName => {
                            return (
                              <Grid>
                              <Typography
                                color="textPrimary"
                                variant="h6"
                              >
                                ontology: {ontologyName}
                              </Typography>
                              <Typography
                                color="textPrimary"
                                variant="h6"
                              >
                                index: {this.state.blockInfoSorted[layerName][ontologyName].index}
                              </Typography>
                                <Typography
                                color="textPrimary"
                                variant="h6"
                              >
                                timestamp: {this.state.blockInfoSorted[layerName][ontologyName].timestamp}
                                </Typography>
                                <Typography
                                color="textPrimary"
                                variant="h6"
                              >
                                data: {this.state.blockInfoSorted[layerName][ontologyName].data}
                                </Typography>
                                <Typography
                                color="textPrimary"
                                variant="h6"
                              >
                                previousHash: {this.state.blockInfoSorted[layerName][ontologyName].previousHash}
                                </Typography>
                                <Typography
                                color="textPrimary"
                                variant="h6"
                              >
                                hash: {this.state.blockInfoSorted[layerName][ontologyName].hash}
                                </Typography>
                              <Divider/>
                              </Grid>
                            )
                          })
                        }
                      </Typography>
                    );
                })
              }
              {/* </Typography> */}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}
export default BlockInfo;
