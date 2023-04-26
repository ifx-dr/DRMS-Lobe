import React, { useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  // Button,
  Divider,
  Drawer,
  Hidden,
  List,
  Typography,
  makeStyles
} from '@material-ui/core';
import {
  // AlertCircle as AlertCircleIcon,
  BarChart as BarChartIcon,
  Lock as LockIcon,
  UserCheck,
  // User as UserIcon,
  // UserPlus as UserPlusIcon,
  // Users as UsersIcon
} from 'react-feather';
import NavItem from './NavItem';

// let user = {
//   //avatar: '/static/images/avatars/avatar_6.png',
//   jobTitle: 'Experts',
//   name: 'Luo'
// };

// let user;
// if(window.userID){
//   user = {
//     //avatar: '/static/images/avatars/avatar_6.png',
//     jobTitle: window.userRole,
//     name: window.userName
//   };
// }
// else{
//   user = {
//     //avatar: '/static/images/avatars/avatar_6.png',
//     jobTitle: 'Visitor',
//     name: 'Bob'
//   };
// }

// const token = sessionStorage.getItem('token');
// const {token, setToken} = useToken();
// let user = {
//   jobTitle: 'Visitor',
//   name: token.ID
// }

const items = [
  {
    href: '/app/login',
    icon: LockIcon,
    title: 'Login'
  },
  {
    href: '/app/dashboard',
    icon: BarChartIcon,
    title: 'Dashboard'
  },
  {
    href: '/app/createProposal',
    icon: UserCheck,
    title: 'Create New Proposal'
  },
  {
    href: '/app/vetoProposal',
    icon: UserCheck,
    title: 'Create Veto Proposal',
  },
  {
    href: '/app/validateProposal',
    icon: UserCheck,
    title: 'Vote for a Proposal'
  },
  {
    href: '/app/generateBlock',
    icon: UserCheck,
    title: 'Generate New Block'
  },
  {
    href: '/app/blockchain',
    icon: BarChartIcon,
    title: 'View Blockchain'
  },
  // {
  //   href: '/app/testPage',
  //   icon: UserCheck,
  //   title: 'test page'
  // }
];

const useStyles = makeStyles(() => ({
  mobileDrawer: {
    width: 256
  },
  desktopDrawer: {
    width: 256,
    top: 64,
    height: 'calc(100% - 64px)'
  },
  avatar: {
    cursor: 'pointer',
    width: 64,
    height: 64
  }
}));

const NavBar = ({ onMobileClose, openMobile }) => {
  const classes = useStyles();
  const location = useLocation();

  // const {token, setToken} = useToken();
  // console.log(token)
  let token = sessionStorage.getItem('token');
  let user;
  if(token!=null){
    token = JSON.parse(token);
    user = {
      jobTitle: token.Name,
      name: token.ID
    }
  }
  else{
    user = {
      jobTitle: 'Visitor',
      name: "Bob"
    }
  }
  // let user = {
  //   jobTitle: 'Visitor',
  //   name: "Bob"
  // }

  useEffect(() => {
    if (openMobile && onMobileClose) {
      onMobileClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const content = (
    <Box
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <Box
        alignItems="center"
        display="flex"
        flexDirection="column"
        p={2}
      >
        <Avatar
          className={classes.avatar}
          component={RouterLink}
          src={user.avatar}
          to="/app/account"
        />
        <Typography
          className={classes.name}
          color="textPrimary"
          variant="h5"
        >
          {user.name}
        </Typography>
        <Typography
          color="textSecondary"
          variant="body2"
        >
          {user.jobTitle}
        </Typography>
      </Box>
      <Divider />
      <Box p={2}>
        <List>
          {items.map((item) => (
            <NavItem
              href={item.href}
              key={item.title}
              title={item.title}
              icon={item.icon}
            />
          ))}
        </List>
      </Box>
      <Box flexGrow={1} />
    </Box>
  );

  return (
    <>
      <Hidden lgUp>
        <Drawer
          anchor="left"
          classes={{ paper: classes.mobileDrawer }}
          onClose={onMobileClose}
          open={openMobile}
          variant="temporary"
        >
          {content}
        </Drawer>
      </Hidden>
      <Hidden mdDown>
        <Drawer
          anchor="left"
          classes={{ paper: classes.desktopDrawer }}
          open
          variant="persistent"
        >
          {content}
        </Drawer>
      </Hidden>
    </>
  );
};

NavBar.propTypes = {
  onMobileClose: PropTypes.func,
  openMobile: PropTypes.bool,
  user: PropTypes.string,
};

NavBar.defaultProps = {
  onMobileClose: () => {},
  openMobile: false,
  user: 'Luo'
};

export default NavBar;
