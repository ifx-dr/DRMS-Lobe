import React, { Component } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  makeStyles
} from '@material-ui/core';
import Page from 'src/components/Page';

import Tokens from './Tokens';
import WebVowl from './WebVowl';
import LatestDR from './LatestDR';
import TotalMembers from './TotalMembers';
import UploadDR from './UploadDR';
import DRHash from './DRHash';
// import useToken from 'src/useToken';
const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  }
}));

// class DB extends Component{
//   constructor(props) {
//     super(props);
//     this.state = {
//       userName: '',
//       ID: '',
//       PWD: '',
//       flag: false
//     }
//   }

//   render(){
//     const classes = useStyles();
//     let location = useLocation();
//     console.log(location);
//     if(location.state!=null&&location.state.flag==true){
//       this.setState(location.state)
//       window.userID = this.state.ID;
//       window.userName = this.state.userName;
//       window.userRole = 'Expert';
//     }
//     else{
//       window.userID = 'visitor';
//       window.userName = 'Bob';
//       window.userRole = 'Visitor';
//     }
//     return (
//       <Page
//       className={classes.root}
//       title="Dashboard"
//     >
//       <Container maxWidth={false}>
//         <Grid
//           container
//           spacing={3}
//         >
//           <Grid
//             item
//             lg={2}
//             sm={3}
//             xl={2}
//             xs={12}
//           >
//             <Tokens />
//           </Grid>
//           <Grid
//             item
//             lg={2}
//             sm={3}
//             xl={2}
//             xs={12}
//           >
//             <TotalMembers />
//           </Grid>

//           <Grid
//             item
//             lg={5}
//             sm={9}
//             xl={2}
//             xs={12}
//           >
//             <LatestDR />
//           </Grid>
//           <Grid
//             item
//             lg={5}
//             sm={9}
//             xl={3}
//             xs={12}
//           >
//             <DRHash />
//           </Grid>
//           <Grid
//             item
//             lg={3}
//             sm={6}
//             xl={3}
//             xs={12}
//           >
//             <UploadDR />
//           </Grid>
//           <Grid
//             item
//             lg={8}
//             md={12}
//             xl={9}
//             xs={12}
//           >
//             <WebVowl />
//           </Grid>
//         </Grid>
//       </Container>
//     </Page>
//     )
//   }
// }

const Dashboard = () => {
  const classes = useStyles();
  let location = useLocation();
  console.log(location);
  // if(location.state!=null&&location.state.flag==true){
    
  //   window.userID = location.state.ID;
  //   window.userName = location.state.userName;
  //   window.userRole = 'Expert';
  // }
  // else{
  //   window.userID = 'visitor';
  //   window.userName = 'Bob';
  //   window.userRole = 'Visitor';
  // }
  // const {token, setToken} = useToken();
  // let token = sessionStorage.getItem('token');
  // if(token!=null){

  // }
  return (
    <Page
      className={classes.root}
      title="Dashboard"
    >
      <Container maxWidth={false}>
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            lg={2}
            sm={3}
            xl={2}
            xs={12}
          >
            <Tokens />
          </Grid>
          <Grid
            item
            lg={2}
            sm={3}
            xl={2}
            xs={12}
          >
            <TotalMembers />
          </Grid>

          <Grid
            item
            lg={5}
            sm={9}
            xl={2}
            xs={12}
          >
            <LatestDR />
          </Grid>
          <Grid
            item
            lg={5}
            sm={9}
            xl={3}
            xs={12}
          >
            <DRHash />
          </Grid>
          {/* <Grid
            item
            lg={3}
            sm={6}
            xl={3}
            xs={12}
          >
            <UploadDR />
          </Grid> */}
          <Grid
            item
            lg={8}
            md={12}
            xl={9}
            xs={12}
          >
            <WebVowl />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
};

export default Dashboard;
// export default DB;
