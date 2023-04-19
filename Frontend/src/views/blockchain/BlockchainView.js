import React, { Component } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography
} from '@material-ui/core';

class Blockchain extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Blockchain: [],
    }
  }
  componentDidMount(){
    this.getBlockchain();
  }
  getBlockchain = async () => {
    try{
      let blockchain = await fetch('http://localhost:3001/checkBlockchain').then((response) => response.json());
      if(!blockchain.error){
        // alert(blockchain.success)
        // a list of blocks
        blockchain = JSON.parse(blockchain.success);
        for(let i=0;i<blockchain.length;i++){
          // blockchain[i] = JSON.parse(blockchain[i]);
          if(blockchain[i].data.includes('UpdatedVersion'))
            blockchain[i].data = JSON.parse(blockchain[i].data);
        }
        this.setState({
          Blockchain: blockchain,
        });
      }
      else{
        alert(blockchain.error)
      }
    }
    catch{}
  };
  render(){
    return (
      <Card>
        <CardHeader
          title="View Blockchain"
          subheader="View the manual blockchain for previous versions"
        />
        <Divider />
        <CardContent>
          <Grid
            container
            spacing={10}
            wrap="wrap"
          >
            <Grid
              item
              md={10}
              sm={10}
              xs={12}
            >
              <Typography
                color="textPrimary"
                gutterBottom
                variant="h6"
              >
                {
                  this.state.Blockchain.reverse().map((value, index) => {
                    return(
                  <Typography
                    color="textPrimary"
                    gutterBottom
                    variant="h6"
                  >
                    <p>
                      index: {value.index}
                    </p>
                    <p>
                      timestamp: {value.timestamp}
                    </p>
                    <p>
                      data: {!(value.data.ProposedVersion)&&!(value.data.UpdatedVersion)?<button><a href={value.data} style={{"text-decoration":"none"}} target="_blank" rel={"noopener noreferrer"}>check data</a></button>:''}
                      {(value.data.ProposedVersion)?<button><a href={value.data.ProposedVersion} style={{"text-decoration":"none"}} target="_blank" rel={"noopener noreferrer"}>check ProposedVersion</a></button>:''}
                      {(value.data.UpdatedVersion)?<button><a href={value.data.UpdatedVersion} style={{"text-decoration":"none"}} target="_blank" rel={"noopener noreferrer"}>check UpdatedVersion</a></button>:''}
                      <p>{value?(
                        (!(value.data.ProposedVersion)&&!(value.data.UpdatedVersion))?
                        (value.data):
                        (
                          Object.keys(value.data).map((keyName, i) => (
                            <p key={i}>
                              {keyName}: {value.data[keyName]}
                            </p>
                        ))
                        )
                      ):'n/a'}</p>
                    </p>
                    <p>
                      previousHash: {value.previousHash}
                    </p>
                    <p>
                      hash: {value.hash}
                    </p>
                    <Divider />
                    </Typography>
                    )
                  })
                }
                </Typography>
              <Divider />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}
export default Blockchain;
