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

export default class CreateNewProp extends Component {
  constructor() {
    super();
    this.state = {
      Type: 'newProposal',
      Domain: '',
      URI: '',
      Valid: '',
      Author: window.userID,
      Creation_Date: '',
      Messages: ''
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
  handleChangeM = async (event) => {
    let value = event.target.value
    this.setState({
      Creation_Date: Date(),
      Messages: value,
    });
    console.log(this.state.Author);
  }

  handleSubmit = async(event) => {
    event.preventDefault();
    const data = {
      type: this.state.Type,
      domain: this.state.Domain,
      author: this.state.Author,
      uri: this.state.URI,
      message: this.state.Messages,
      originalID: ''}
      console.log('****New Proposal invokes createProposal api*********');
      fetch('http://localhost:3001/createProposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(function(response){
        alert('Your proposal is created');
        return response.json()
      }).then(function(body){
        console.log(body);
      });
  }
  render()
    {
      return (
        <form onSubmit={this.handleSubmit} >
          <Card>
            <CardHeader
              subheader="This operation charges you 20 tokens as deposit."
              title="Create New Proposal"
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
                    <option value='Product'>(Arrowhead) Cloud</option>
                    <option value='Power'>Power</option>
                    <option value='Process'>Process</option>
                    <option value='Sensor'>Sensor</option>
                    <option value='SupplyChain'>Supply Chain</option>
                    <option value='System'>System</option>
                    <option value='WiredCommunication'>Wired Communication</option>
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
