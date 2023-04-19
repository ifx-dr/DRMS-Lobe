import React, { Component } from 'react';
import { Avatar, Card, CardContent, Grid, Typography } from '@material-ui/core';
import AccountBalance from '@material-ui/icons/AccountBalance';

class Tokens extends Component {
  constructor(props) {
    super(props);
    this.state = { tokens: null };
  }

  componentDidMount() {
    this.getTokens();
  }

  getTokens = async () => {
    const data = {
      id: 'visitor'
    }
    let token = 0;
    let session_token = sessionStorage.getItem('token')
    if(session_token!=null){
      data.id = JSON.parse(session_token).ID;
    }
    // if(window.userID) {
    //   data.id = window.userID;
    // }
    // const data = await fetch('http://localhost:3001/tokens').then((response) => response.json());
    try{
      await fetch('http://localhost:3001/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(function(response){
        return response.json();
      }).then(function(body){
        if(!body.error){
          token=body.success;
          console.log(body);
        }
        else{
          alert(body.error)
        }
      })
      console.log('RESULT= ' + token);
      this.setState({
        tokens: token
      })
      console.log('***********Succesfully invoke func '+this.state.tokens);
    }
    catch (error) {
      alert(error);
    }
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
                Your Tokens:
              </Typography>
              <Typography
                color="textPrimary"
                variant="h4"
              >
                {this.state.tokens}
              </Typography>
            </Grid>
            <Grid item>
              <Avatar>
                <AccountBalance />
              </Avatar>
            </Grid>
          </Grid>

        </CardContent>
      </Card>
    );
  }
}
export default Tokens;
