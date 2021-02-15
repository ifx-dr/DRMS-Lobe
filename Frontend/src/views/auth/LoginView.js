import React, { Component } from 'react';
import {
  Button,
  TextField,
  Card, CardHeader, Divider, CardContent, Input
} from '@material-ui/core';

export default class LoginViews extends Component {
  constructor() {
    super();
    this.state = {
      ID: '',
      PWD: ''
    }
  }
  handleChangeN = async (event) => {
    let value = event.target.value;
    this.setState({
      ID: value
    })
  }
  handleChangePWD = async (event) => {
    let value = event.target.value;
    this.setState({
      PWD: value
    })
  }
  handleSubmit = async (event) => {
    event.preventDefault();
    window.userID =this.state.ID
    console.log(window.userID);
  }
  updateEmployeeDetails = (event) => {
    this.setState({ data:{Id:event.target.value} });
  };
  render() {
    const EmployeeContext = React.createContext({
      data: '',
      changeEmployeeInfo: () => {},
    });
    return (

      <form onSubmit={this.handleSubmit} >
        <Card>
          <CardHeader
            subheader= {window.userID} //"This is a mock page for log in"
            title="Log in"
          />
          <Divider />
          <CardContent>
            <TextField
              fullWidth
              onChange={this.handleChangeN}
              label="User ID"
              margin="normal"
              name="ID"
              type="ID"
              value={this.state.ID}
              variant="outlined"
            />
            <TextField
              fullWidth
              onChange={this.handleChangePWD}
              label="Password"
              margin="normal"
              name="PWD"
              type="PWD"
              value={this.state.PWD}
              variant="outlined"
            />
          </CardContent>
          <Divider />
          <Button variant="contained" color="primary">
            <Input style={{color: "white"}} type="submit" value="Submit"/>
          </Button>
          <EmployeeContext.Provider value={this.state}/>

        </Card>
      </form>)
  }
};
