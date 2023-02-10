import React, { Component } from 'react';
import { withRouter, useNavigate, Link, Navigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Card, CardHeader, Divider, CardContent, Input
} from '@material-ui/core';
import useToken from 'src/useToken';
import Tokens from '../reports/DashboardView/Tokens';

class LoginViews extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      ID: '',
      PWD: '',
      flag: false
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
  getMemberInfo = async () => {
    
    // const data = await fetch('http://localhost:3001/memberInfo').then((response) =>response.json());
    // this.setState({
    //   members: data
    // })
    // const navigate = useNavigate();
    let data = {
      memberID: this.state.ID
    };
    // let flag = 1;
    let result = await fetch('http://localhost:3001/memberInfo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }).then(function(response){
          return response.json();
        }).then(function(body){
          console.log(body);
          if(!body.error){
            window.userID = body.ID;
            window.userName = body.Name;
            window.userRole = body.Role;
            alert(`
                   ID:   ${window.userID}\n
                   Name: ${window.userName}\n
                   Role: ${window.userRole}\n
                   login success`);
            // this.props.history.push('/app/dashboard')
            // flag = 0;
            // return 0;
            // window.location = "/app/dashboard";
            // navigate('/app/dashboard');
          }
          else{
            alert(body.error);
            // return 1;
          }
        })
    // if(window.userName){
      
    //   navigate('/app/dashboard');
    // }
  };
  async handleSubmit(event)  {
    // let navigate = useNavigate();
    // const {token, setToken} = useToken();
    event.preventDefault();
    let data = {
      memberID: this.state.ID
    };
    console.log("get memberInfo: "+data.memberID);
    // let flag = 1;
    let result = await fetch('http://localhost:3001/memberInfo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }).then((response)=>{
          return response.json();
        }).then((body)=>{
          console.log(body);
          // re-login: update token
          // setToken(body);
          sessionStorage.setItem('token',JSON.stringify(body.success));
          if(!body.error){
            window.userID = body.success.ID;
            window.userName = body.success.Name;
            // window.userRole = body.Role;
            alert(`
                   ID:   ${window.userID}\n
                   Name: ${window.userName}\n
                   login success`);
            this.setState({
              flag: true,
            })
            // alert(`
            //        ID:   ${window.userID}\n
            //        Name: ${window.userName}\n
            //        Role: ${window.userRole}\n
            //        login success`);
            // this.props.history.push('/app/dashboard')
            // flag = 0;
            // return 0;
            // window.location = "/app/dashboard";
            
            // navigate('http://localhost:3006/app/dashboard/');
          }
          else{
            alert(body.error);
            // return 1;
          }
        })

    // window.userID =this.state.ID
    
    // this.getMemberInfo().then(()=>{
    //   console.log(window.userID);
    //   // navigate('../dashboard');
    //   // window.location.href = "/app/dashboard";
    // });
  }
  updateEmployeeDetails = (event) => {
    this.setState({ data:{Id:event.target.value} });
  };
  render() {
    const EmployeeContext = React.createContext({
      data: '',
      changeEmployeeInfo: () => {},
    });
    if(this.state.flag){
      return <Navigate to='/app/dashboard' state={this.state}></Navigate>
    }
    return (
      <form onSubmit={this.handleSubmit.bind(this)} >
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
export default LoginViews;