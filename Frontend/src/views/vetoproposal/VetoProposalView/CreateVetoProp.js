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

export default class CreateVetoProp extends Component {
  constructor() {
    super();
    this.state = {
      Type: '',
      Domain: '',
      URI: '',
      Valid: '',
      Author: '',
      OriginalID: '',
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
  handleChangeM = async (event) => {
    let value = event.target.value
    this.setState({
      Author: 'member1',
      Creaton_Date: Date(),
      Messages: value,
    });
  }
  handleSubmit = async(event) => {
    event.preventDefault();
    const data = {
      type: 'vetoProposal',
      domain: this.state.Domain,
      uri: this.state.URI,
      message: this.state.Messages,
      originalID: this.state.OriginalID}
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
