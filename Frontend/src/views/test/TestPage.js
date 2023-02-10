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
import configJS from 'src/config.json'

export default class TestPage extends Component {
  constructor() {
    super();
    this.state = {
      Type: '',
      Domain: '',
      URI: '',
      Valid: '',
      Author: '',
      // Author: token.username,
      OriginalID: '',
      Creation_Date: '',
      Messages: '',
      Download:'',
      Redirect: '',
      newBlockReq:'',
      allDomains:['a','b','c'],
      newDomain: ''
    }
  }
  componentDidMount(){
    this.loadDomains()
  }
  // getNewBlockRequest = async () => {
  //   let token = sessionStorage.getItem('token');
  //   if(token==null){
  //     this.setState({
  //       Redirect:'Login'
  //     })
  //     alert('Please login in!');
  //     return;
  //   }
  //   token = JSON.parse(token);
  //   let newBlockReq = await fetch('http://localhost:3001/checkNewBlockRequest').then((response) => response.json());
  //   newBlockReq = JSON.parse(newBlockReq);
  //   if(newBlockReq.newBlockWaiting==='true'){
  //     if(newBlockReq.author===token.ID||newBlockReq.lobeOwner===token.ID){
  //       alert('A new block is to be generated before a new proposal!');
  //       this.setState({
  //         Redirect:'GenerateBlock'
  //       })
  //     }
  //     else{
  //       alert('A new block is to be generated: waiting for lobe owner operation');
  //       this.setState({
  //         Redirect:'Dashboard'
  //       })
  //     }
  //     return;
  //   }
  // };

  loadDomains = async () => {
    await fetch('http://localhost:3001/loadDomainsInFrontend', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(function(response){
      return response.json()
    }).then((body)=>{
      alert(body);
      console.log(body);
      this.setState({
        allDomains: JSON.parse(body)
      })
    });
  };
  handleChangeD = async (event) => {
    let value = Array.from(event.target.selectedOptions, option => option.value)
    this.setState({
      Domain: value,
    });
    
  };

  handleNewDomain = async (event) => {
    let value = event.target.value
    this.setState({
      newDomain:value
    });
  }
  handleSubmit = async(event) => {

    event.preventDefault();
    let domain;
    let newConfig = {
      allDomains: this.state.allDomains
    };
    if(this.state.newDomain.length!==0){
      domain = this.state.newDomain;
      // configJS["allDomain"].push(domain);
      if(!(newConfig["allDomains"].find(d => d==domain)))
        newConfig["allDomains"].push(domain);
    }
    else
      domain = this.state.Domain;
    alert(domain)
    await fetch('http://localhost:3001/saveDomainsInFrontend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newConfig)
    })
    // alert('here')
    await fetch('http://localhost:3001/loadDomainsInFrontend', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(function(response){
      return response.json()
    }).then((body)=>{
      // alert(body);
      // console.log(body);
      this.setState({
        allDomains: JSON.parse(body)
      })
    });
    
    
  }
  render()
    {
      return (
        <form onSubmit={this.handleSubmit} >
          <Card>
            <CardHeader
              subheader="a page for reactjs test"
              title="test page"
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
                  <select value={this.state.Domain} onChange={this.handleChangeD}>
                    <option></option>
                    {
                      // 遍历值
                      this.state.allDomains.map((value, index) => {
                          return <option value={value}>{value}</option>
                      })
                    }
                  </select>
                  <TextField
                  fullWidth
                  onChange={this.handleNewDomain}
                  label="New domain? Input the domain name"
                  margin="normal"
                  name="NewDomain"
                  type="NewDomain"
                  value={this.state.NewDomain}
                  variant="outlined"
                />
                </Grid>
              </Grid>
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
