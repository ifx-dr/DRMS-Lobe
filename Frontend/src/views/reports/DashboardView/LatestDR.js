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
    // this.getOngoingDR();
    this.getDRHash();
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
  getDRHash = async () => {
    const DRHash = await fetch('http://localhost:3001/DRHash').then((response) => response.json());
    if(!DRHash.error){
      this.setState({
        Hash: DRHash.success,
      }, console.log(DRHash));
    }
    else{
      alert(DRHash.error)
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
  updateDR = async() => {
    const link = 'https://api.github.com/repos/tibonto/dr/commits/master';
    const prefix = 'https://github.com/tibonto/dr/commit/';
    const downloadPrefix = 'https://github.com/tibonto/dr/archive/'
    fetch(link, {
          method: 'GET',
        //   headers: {
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify(data)
        }).then(function(resp){
            // console.log(resp.json());
            return resp.json();
        }).then((body)=>{
            console.log(body.sha)
            console.log(body.commit.message)
            let newDR = prefix+body.sha;
            let newHash = downloadPrefix + body.sha + '.zip';
            if(this.state.DR!==newDR){
              let req = {
                DR: newDR,
                Hash: newHash
              }
              let result = fetch('http://localhost:3001/updateDR', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(req)
                }).then((response) =>response.json());
              this.setState({
                DR: newDR,
                // commitMessage: body.commit.message
                Hash: newHash
              })
            }
        })
  }

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
                Here is the latest DR: <button><a href={this.state.DR} style={{"text-decoration":"none"}} target="_blank" rel={"noopener noreferrer"}>check</a></button> <button onClick={this.updateDR}>update</button>
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
                {/* Here is the DR in the ongoing proposal: <button><a href={this.state.OngoingDR} style={{"text-decoration":"none"}} target="_blank" rel={"noopener noreferrer"}>check</a></button> */}
                Here you can download the DR:
                <button><a href={this.state.Hash} style={{"text-decoration":"none"}} target="_blank" rel={"noopener noreferrer"}>download DR</a></button>
              </Typography>
              <Typography
                color="textPrimary"
                variant="h6"
              >
                {this.state.Hash}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}
export default LatestDR;
