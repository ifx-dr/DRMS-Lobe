import React, { Component } from 'react';
import { Avatar, Box, Button, Card, CardContent, Divider, Grid, Typography, CardHeader } from '@material-ui/core';
import PeopleIcon from '@material-ui/icons/PeopleOutlined';
import { DropzoneDialog, DropzoneDialogBase } from 'material-ui-dropzone';
import {DropzoneArea} from 'material-ui-dropzone';

import $ from 'jquery';
import * as axios from 'ajax';
import { Form } from 'formik';
class DRHash extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Hash: '',
      OngoingDR: '',
      AllOngoingProp:[],
    };
  }

  componentDidMount() {
    // this.getDRHash(); // .then(((response) => console.log(response)));
    this.getOngoingDR();
    this.getAllOngoingProposals();
  }
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
  handleClose = async() => {
    this.setState({
      open: false
    })
  };
  getAllOngoingProposals = async() => {
    const allOngoingProp = await fetch('http://localhost:3001/allOngoingProp').then((response) => response.json());
    if(!allOngoingProp.error){
      this.setState({
        AllOngoingProp: allOngoingProp.success,
      }, console.log(allOngoingProp));
    }
    else{
      alert(allOngoingProp.error);
    }
  }

  render() {
    return (
      <Card>
        <CardHeader
        title="Ongoing proposal"
        />
        <Divider />
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
                {/* Here is the DR in the ongoing proposal: <button><a href={this.state.OngoingDR} style={{"text-decoration":"none"}} target="_blank" rel={"noopener noreferrer"}>check</a></button> */}
                Here are all ongoing proposals: {this.state.AllOngoingProp.length===0?'no ongoing proposal':''}
              </Typography>
              {
                this.state.AllOngoingProp.map((value, index)=>{
                  return (
                    <Typography
                      color="textPrimary"
                      variant="h6"
                    >
                      <p>proposalID: {value.ID} </p>
                      <p>Layer: {value.Layer}</p>
                      <p>Ontology: {value.Ontology}</p>
                      <p>URI: <a href={value.URI} target="_blank" rel={"noopener noreferrer"}>{value.URI}</a></p>
                      <Divider/>
                    </Typography>
                    
                  )
                })
              }
              <Typography
                color="textPrimary"
                variant="h6"
              >
                
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
