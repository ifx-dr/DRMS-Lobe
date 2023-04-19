import React, { Component } from 'react';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';
// import { Avatar, Box, Button, Card, CardContent, Grid, Typography } from '@material-ui/core';
// import PeopleIcon from '@material-ui/icons/PeopleOutlined';
// import { DropzoneDialog, DropzoneDialogBase } from 'material-ui-dropzone';
// import {DropzoneArea} from 'material-ui-dropzone';

// import $ from 'jquery';
// import * as axios from 'ajax';
// import { Form } from 'formik';
class DRHash extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Hash: '',
      OngoingDR: ''
    };
  }

  componentDidMount() {
    this.getOngoingDR()
  }
  getOngoingDR = async () => {
    try{
      const OngoingDR = await fetch('http://localhost:3001/OngoingDR').then((response) => response.json());
      if(!OngoingDR.error){
        this.setState({
          OngoingDR: OngoingDR.success,
        }, console.log(OngoingDR));
      }
      else{
        alert(OngoingDR.error);
      }
    }
    catch (error) {
      // alert(error);
    }
  };
  handleClose = async() => {
    this.setState({
      open: false
    })
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
                {/* Here you can download the DR:
                <button><a href={this.state.Hash} style={{"text-decoration":"none"}} target="_blank" rel={"noopener noreferrer"}>download DR</a></button> */}
                Here is the DR in the ongoing proposal: <button><a href={this.state.OngoingDR} style={{"text-decoration":"none"}} target="_blank" rel={"noopener noreferrer"}>check</a></button>
              </Typography>
              <Typography
                color="textPrimary"
                variant="h6"
              >
                {this.state.OngoingDR}
              </Typography>
              {/* <button>
              <a style='text-decoration:none;' href="https://www.w3schools.com" 
               target="_blank">
                download DR 
              </a></button> */}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}
export default DRHash;
