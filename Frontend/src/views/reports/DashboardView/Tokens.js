import React, { Component } from 'react';
import { Avatar, Box, Card, CardContent, Grid, Typography } from '@material-ui/core';
import AccountBalance from '@material-ui/icons/AccountBalance';

class Tokens extends Component {
  constructor(props) {
    super(props);
    this.state = { tokens: [] };
  }

  componentDidMount() {
    this.getTokens();
  }

  getTokens = async () => {
    let data = {
      id: 'member1'
    }
    if(window.userID) {data.id = window.userID;}
    // const data = await fetch('http://localhost:3001/tokens').then((response) => response.json());
    let result = await fetch('http://localhost:3001/tokens', {
          mode: 'no-cors',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }).then(function(response){
          alert('***********Succesfully invoke func'+response.json())
          return response;
        }).then(function(body){
          console.log(body);
        })
    this.setState({
      tokens: result
    })
    console.log('***********Succesfully invoke func'+this.state.tokens);
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
                Your Tokens：
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
