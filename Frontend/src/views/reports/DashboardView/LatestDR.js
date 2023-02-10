import React, { Component } from 'react';
import { Avatar, Box, Button, Card, CardContent, Grid, Typography } from '@material-ui/core';
import PeopleIcon from '@material-ui/icons/PeopleOutlined';
import { DropzoneDialog, DropzoneDialogBase } from 'material-ui-dropzone';
import {DropzoneArea} from 'material-ui-dropzone';

import $ from 'jquery';
import * as axios from 'ajax';
import { Form } from 'formik';
class LatestDR extends Component {
  constructor(props) {
    super(props);
    this.state = {
      DR: '',
      OngoingDR: '',
      files: null,
      open: false,
    };
  }

  componentDidMount() {
    this.getLatestDR(); // .then(((response) => console.log(response)));
    this.getOngoingDR();
  }

  getLatestDR = async () => {
    const DRURI = await fetch('http://localhost:3001/DR').then((response) => response.json());
    if(!DRURI.error){
      this.setState({
        DR: DRURI.success,
      }, console.log(DRURI));
    }
    else{
      alert(DRURI.error);
    }
  };
  getOngoingDR = async () => {
    const OngoingDR = await fetch('http://localhost:3001/OngoingDR').then((response) => response.json());
    if(!OngoingDR.error){
      this.setState({
        OngoingDR: OngoingDR.success,
      }, console.log(OngoingDR));
    }
    else{
      alert(OngoingDR.error);
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
                Here is the latest DR: <button><a href={this.state.DR} style={{"text-decoration":"none",}} target="_blank">check</a></button>
              </Typography>
              <Typography
                color="textPrimary"
                variant="h6"
              >
                {this.state.DR}
              </Typography>
              <Typography
                color="textSecondary"
                gutterBottom
                variant="h6"
              >
                Here is the DR in the ongoing proposal: <button><a href={this.state.OngoingDR} style={{"text-decoration":"none",}} target="_blank">check</a></button>
              </Typography>
              <Typography
                color="textPrimary"
                variant="h6"
              >
                {this.state.OngoingDR}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}
export default LatestDR;
