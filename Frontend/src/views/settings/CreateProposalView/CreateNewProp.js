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
      URI: '',
      Valid: '',
      // Author: window.userID,
      Author: '',
      Creation_Date: '',
      Messages: '',
      Download: '',
      Redirect:''
    }
  }

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
    const data = {
      type: this.state.Type,
      domain: this.state.Domain,
      // author: this.state.Author,
      author: token.ID,
      // author: 'member1',
      uri: this.state.URI,
      message: this.state.Messages,
      download: this.state.Download,
      originalID: ''}
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
        alert(body);
        console.log(body);
        
        this.setState({
          Redirect:'Dashboard'
        });
      });
  }
  render()
    {
      if(this.state.Redirect=='Login'){
        return <Navigate to='/app/login' state={this.state}></Navigate>
      }
      else if(this.state.Redirect=='Dashboard'){
        return <Navigate to='/app/dashboard' state={this.state}></Navigate>
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
