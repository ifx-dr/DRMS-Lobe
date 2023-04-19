import React, { Component } from 'react';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';
// import { Avatar, Box, Button, Card, CardContent, Grid, Typography } from '@material-ui/core';
// import PeopleIcon from '@material-ui/icons/PeopleOutlined';
// import { DropzoneDialog, DropzoneDialogBase } from 'material-ui-dropzone';
// import {DropzoneArea} from 'material-ui-dropzone';

// import $ from 'jquery';
// import * as axios from 'ajax';
// import { Form } from 'formik';
class LatestDR extends Component {
  constructor(props) {
    super(props);
    this.state = {
      DR: '',
      OngoingDR: '',
      Repo: null,
      files: null,
      open: false,
    };
  }

  componentDidMount() {
    this.getRepo();
    this.getLatestDR(); // .then(((response) => console.log(response)));
    // this.getOngoingDR();
    this.getDRHash();
  }
  getRepo = async () => {
    try{
      const Repo = await fetch('http://localhost:3001/Repo').then((response) => response.json());
      if(!Repo.error){
        this.setState({
          Repo: Repo.success,
        }, console.log(Repo));
      }
      else{
        alert(Repo.error);
      }
    }
    catch (error){
      // alert(error);
    }
  }
  getLatestDR = async () => {
    try{
      const DRURI = await fetch('http://localhost:3001/DR').then((response) => response.json());
      if(!DRURI.error){
        this.setState({
          DR: DRURI.success,
        }, console.log(DRURI));
      }
      else{
        alert(DRURI.error);
      }
    }
    catch (error){
      // alert(error);
    }
  };
  getDRHash = async () => {
    try{
      const DRHash = await fetch('http://localhost:3001/DRHash').then((response) => response.json());
      if(!DRHash.error){
        this.setState({
          Hash: DRHash.success,
        }, console.log(DRHash));
      }
      else{
        alert(DRHash.error)
      }
    }
    catch (error){
      // alert(error);
    }
  };
  handleClose = async() => {
    this.setState({
      open: false
    })
  };
  updateDR = async() => {
    let link = '';
    let prefix = '';
    if(this.state.Repo.Platform==='GitHub'){
      link = `https://api.github.com/repos/${this.state.Repo.RepoName}/commits/${this.state.Repo.DefaultBranch}`;
      prefix = `https://github.com/${this.state.Repo.RepoName}/commit/`;
    }
    else{
      // '/' in author/repo needs to be replaced with %2F
      let rp = this.state.Repo.RepoName.split('/')[0] + '%2F' + this.state.Repo.RepoName.split('/')[1];
      link = `https://gitlab.intra.infineon.com/api/v4/projects/${rp}/repository/commits/${this.state.Repo.DefaultBranch}`;
      prefix = `https://gitlab.intra.infineon.com/api/v4/projects/${rp}/repository/commits/`;
    }
     
    const downloadPrefix = `https://github.com/${this.state.Repo.RepoName}/archive/`;
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
          let newDR = '';
          let newHash = '';
          if(this.state.Repo.Platform==='GitHub'){
            console.log(body.sha)
            console.log(body.commit.message)
            newDR = prefix+body.sha;
            newHash = downloadPrefix + body.sha + '.zip';
          }
          else{
            console.log(body.id)
            console.log(body.message)
            newDR = prefix+body.id;
            // fake: GitLab download link is different
            newHash = downloadPrefix + body.id + '.zip';
          }
          if(this.state.DR!==newDR){
            let req = {
              DR: newDR,
              Hash: newHash
            }
            fetch('http://localhost:3001/updateDR', {
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
                <p>For visualization, please check:<a href={'https://service.tib.eu/sc3/'} target="_blank" rel={"noopener noreferrer"}>https://service.tib.eu/sc3/</a></p>
                Here is the latest DR: <button><a href={this.state.DR} style={{"text-decoration":"none"}} target="_blank" rel={"noopener noreferrer"}>check</a></button> {/* <button onClick={this.updateDR}>update</button> */}
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
