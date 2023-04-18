import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Card, CardHeader, Divider, CardContent, Input
} from '@material-ui/core';

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
  async handleSubmit(event)  {
    // let navigate = useNavigate();
    // const {token, setToken} = useToken();
    event.preventDefault();
    let data = {
      memberID: this.state.ID,
      password: this.state.PWD,
    };
    console.log("get memberInfo: "+data.memberID);
    // let flag = 1;
    let result = await fetch('http://localhost:3001/login', {
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
          if(!body.error){
            // window.userRole = body.Role;
            body = body.success;
            if(body.Fail){
              alert(body.Fail)
              return;
            }
            sessionStorage.setItem('token',JSON.stringify(body));
            alert(`
                   ID:   ${body.ID}\n
                   Name: ${body.Name}\n
                   login success`);
            this.setState({
              flag: true,
            })
          }
          else{
            alert(body.error);
            // return 1;
          }
        })
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