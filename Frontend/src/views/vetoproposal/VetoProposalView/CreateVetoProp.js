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

export default class CreateVetoProp extends Component {
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
      newBlockReq:''
    }
  }
  componentDidMount(){
    this.getNewBlockRequest();
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
  handleChangeO = async (event) => {
    let value = event.target.value;
    this.setState({
      OriginalID: value,
    });
  }
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
      Author: 'member1',
      Creaton_Date: Date(),
      Messages: value,
    });
  }
  handleSubmit = async(event) => {
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
      type: 'vetoProposal',
      domain: this.state.Domain,
      uri: this.state.URI,
      message: this.state.Messages,
      originalID: this.state.OriginalID,
      // author: window.userID,
      author: token.ID,
      download: this.state.Download
    }
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
    if(data.originalID.length===0){
      alert('Please input the original proposal ID!');
      return;
    }
    // console.log('veto: '+token);
      console.log('****New Proposal invokes createProposal api*********');
    await fetch('http://localhost:3001/createProposal', {
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
        alert(body);
        console.log(body);
        this.setState({
          Redirect:'Dashboard'
        });
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
        <form onSubmit={this.handleSubmit} >
          <Card>
            <CardHeader
              subheader="A veto proposal can only be created by a lobe owner, as well as within 30 days since the original proposal has been created"
              title="Create Veto Proposal"
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
                    <option value='Planning'>Planning</option>
                    <option value='Time'>Time</option>
                    <option value='Supply Chain'>Supply Chain</option>
                    <option value='Organisation'>Organisation</option>
                    <option value='Semiconductor Production'>Semiconductor Production</option>
                    <option value='Product'>Product</option>
                    <option value='Power'>Power</option>
                    <option value='Sensor'>Sensor</option>
                    <option value='Semi-conductor Development'>Semi-conductor Development</option>
                    <option value='System'>System</option>
                    <option value='Process'>Process</option>
                    <option value='Wired Communication'>Wired Communication</option>
                    <option value='Cloud'>Cloud</option>
                  </select>
                </Grid>
              </Grid>
                <TextField
                  fullWidth
                  onChange={this.handleChangeO}
                  label="Original Proposal ID"
                  margin="normal"
                  name="OriginalID"
                  type="OriginalID"
                  value={this.state.OriginalID}
                  variant="outlined"
                />
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
