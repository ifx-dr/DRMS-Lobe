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
      author:'',
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

  getAuthor = async () => {
    const data = await fetch('http://localhost:3001/checkUpload').then((response) =>response.json());
    console.log(data);
    this.setState({
      author: data
    })
  };

  handleSubmit = async(e) => {
    e.preventDefault();
    await this.getAuthor();
    if (this.state.author !== window.userID) {
      alert('Sorry, only the author of the ongoing proposal can upload');
      return;
    }
    alert('Uploading...', '', [], {cancelable: true});
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
