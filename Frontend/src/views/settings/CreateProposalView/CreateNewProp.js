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

export default class CreateNewProp extends Component {
  constructor() {
    super();
    this.state = {
      Type: 'newProposal',
      Domain: '',
      NewDomain: '',
      URI: '',
      Valid: '',
      // Author: window.userID,
      Author: '',
      Creation_Date: '',
      Messages: '',
      Download: '',
      Redirect:'',
      allDomains: [],
      newBlockReq:''
    }
  }
  componentDidMount(){
    this.getNewBlockRequest();
    this.loadDomains();
  }
  loadDomains = async () => {
    await fetch('http://localhost:3001/loadDomainsInFrontend', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(function(response){
      return response.json()
    }).then((body)=>{
      // alert(body);
      console.log(body);
      this.setState({
        allDomains: JSON.parse(body)
      })
    });
  };
  saveDomains = async (newConfig) => {
    await fetch('http://localhost:3001/saveDomainsInFrontend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newConfig)
    })
  }
  getNewBlockRequest = async () => {
    let token = sessionStorage.getItem('token');
    if(token==null){
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
      alert(newBlockReq.error);
      this.setState({
        Redirect:'Dashboard'
      })
      return;
    }
    // alert(JSON.stringify(newBlockReq));
    newBlockReq = newBlockReq.success;
    if(newBlockReq.newBlockWaiting==='true'){
      if(newBlockReq.author===token.ID||newBlockReq.lobeOwner===token.ID){
        alert('A new block is to be generated before a new proposal!');
        this.setState({
          Redirect:'GenerateBlock'
        })
      }
      else{
        alert('A new block is to be generated: waiting for lobe owner operation');
        this.setState({
          Redirect:'Dashboard'
        })
      }
      return;
    }
  };

  handleChangeD = async (event) => {
    let value = Array.from(event.target.selectedOptions, option => option.value)
    this.setState({
      Domain: value,
    });
  };
  handleChangeU = async (event) => {
    let value = event.target.value;
    this.setState({
      URI: value
    })
  }
  handleChangeDL = async (event) => {
    let value = event.target.value;
    this.setState({
      Download: value
    })
  }
  handleChangeM = async (event) => {
    let value = event.target.value
    this.setState({
      Creation_Date: Date(),
      Messages: value,
    });
    console.log(this.state.Author);
  }
  handleNewDomain = async (event) => {
    let value = event.target.value;
    this.setState({
      NewDomain: value
    })
  }

  async handleSubmit(event){
    // const {token, setToken} = useToken();
    let token = sessionStorage.getItem('token');
    if(token==null){
      this.setState({
        Redirect:'Login'
      })
      alert('Please login in!');
      return;
    }
    // console.log("before parse: "+token)
    token = JSON.parse(token);
    // console.log(token);
    // console.log("author: "+token.ID);
    event.preventDefault();

    let domain;
    if(this.state.NewDomain!==''){
      // this.setState({
      //   Domain: this.state.NewDomain
      // })
      // console.log(this.state.Domain)
      // console.log(this.state.NewDomain)
      domain = this.state.NewDomain;
      if(!(this.state.allDomains.find(d => d==domain))){
        let newConfig = {
          allDomains: this.state.allDomains
        };
        newConfig["allDomains"].push(domain);
        await this.saveDomains(newConfig);
        await this.loadDomains();
      }
    }
    else
      domain = this.state.Domain;

    const data = {
      type: this.state.Type,
      // domain: this.state.Domain,
      domain:domain,
      // author: this.state.Author,
      author: token.ID,
      // author: 'member1',
      uri: this.state.URI,
      message: this.state.Messages,
      download: this.state.Download,
      originalID: ''
    }
    // check if input is valid
    if(data.domain.length===0){
      alert('Please choose a domain!');
      return;
    }
    if(data.uri.length===0){
      alert('Please input the URI!');
      return;
    }
    if(data.download.length===0){
      alert('Please input the download link!');
      return;
    }
    // alert(JSON.stringify(data));
    // return;
      // console.log("new: "+token)
      console.log('****New Proposal invokes createProposal api*********');
    await fetch('http://localhost:3001/createProposal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(function(response){

      // alert('Your proposal is created');
      return response.json()
    }).then((body)=>{
      // alert(body);
      if(!body.error){
        alert(body.success)
        console.log(body);
        if(body.success!=='please wait')
          this.setState({
            Redirect:'Dashboard'
          });
      }
      else{
        alert(body.error)
      }
    });
  }
  render()
    {
      if(this.state.Redirect==='Login'){
        return <Navigate to='/app/login' state={this.state}></Navigate>
      }
      else if(this.state.Redirect==='Dashboard'){
        return <Navigate to='/app/dashboard' state={this.state}></Navigate>
      }
      else if(this.state.Redirect==='GenerateBlock'){
        return <Navigate to='/app/generateBlock' state={this.state}></Navigate>
      }
      return (
        <form onSubmit={this.handleSubmit.bind(this)} >
          <Card>
            <CardHeader
              title="Create New Proposal"
              subheader="This operation charges you 20 tokens as deposit."
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
                      this.state.allDomains.map((value, index) => {
                          return <option key={index} value={value}>{value}</option>
                      })
                    }
                  </select>
                </Grid>
              </Grid>
                {/* <TextField
                  fullWidth
                  onChange={this.handleNewDomain}
                  label="New domain? Input the domain name"
                  margin="normal"
                  name="NewDomain"
                  type="NewDomain"
                  value={this.state.NewDomain}
                  variant="outlined"
                /> */}
                <TextField
                  fullWidth
                  onChange={this.handleChangeU}
                  label="URI"
                  margin="normal"
                  name="URI"
                  type="URI"
                  value={this.state.URI}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  onChange={this.handleChangeDL}
                  label="Download Link"
                  margin="normal"
                  name="Download Link"
                  type="Download Link"
                  value={this.state.Download}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  onChange={this.handleChangeM}
                  label="Messages"
                  margin="normal"
                  name="Messages"
                  type="Messages"
                  value={this.state.Messages}
                  variant="outlined"
                />
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
