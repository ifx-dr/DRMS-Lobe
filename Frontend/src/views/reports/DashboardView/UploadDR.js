import React, { Component } from 'react';
import { Avatar, Box, Button, Card, CardContent, Grid, Typography } from '@material-ui/core';
import PeopleIcon from '@material-ui/icons/PeopleOutlined';
import { DropzoneDialog, DropzoneDialogBase } from 'material-ui-dropzone';
import {DropzoneArea} from 'material-ui-dropzone';

import $ from 'jquery';
import * as axios from 'ajax';
import { Form } from 'formik';
class UploadDR extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: null,
      open: false,
    };
    this.handleUpload = this.handleUpload.bind(this);
  }
  componentDidMount() {
  }
  handleUpload = async(event) => {
    const file = event.target.files[0];
    alert(file.name);
    console.log(file);
    if(file) {
      this.setState({
        files: file,
      })
    }

  };
  handleSubmit = async(e) => {
    e.preventDefault();
    await this.handleClose();
    if (this.state.open === false) {
      alert('Sorry, only the author of the ongoing proposal can upload');
      return;
    }
    let formData = new FormData();
    formData.append('file', this.state.files);
    for (let key of formData.entries()) {
      console.log(key[0] + ', ' + key[1]);
    }
    const Hash = await fetch('http://localhost:3001/ipfs',{
      mode: 'no-cors',
      method: 'POST',
      body:formData,
    }).then(response => {
      alert('Successfully upload the file!');
      console.log(response);
    })
      .catch(e => {console.log(e)});
  };

  handleClose = async() => {
    const memberID = {
      ID: 'member1'
    }
    let result = await fetch('http://localhost:3001/checkUpload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(memberID)
    }).then(function(response){
      return response.json()
    }).then(function(body){
      console.log(body);
    });
    console.log('Result is '+result);
    this.setState({
      open: result
    })
  };

  handleOpen = async() => {
    this.setState({
      open: true
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
                Only the author of the ongoing proposal can upload related DR file
              </Typography>
              <Typography
                color="textPrimary"
                variant="h4"
              >
                Please Upload the ongoing proposal
              </Typography>

            </Grid>
            <div>
              <input type="file" name="file" onChange={this.handleUpload} />
              <button onClick={this.handleSubmit}>
                Upload
              </button>
            </div>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}
export default UploadDR;
