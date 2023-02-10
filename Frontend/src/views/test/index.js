import React from 'react';
import {
  Box,
  Container,
  makeStyles
} from '@material-ui/core';
import Page from 'src/components/Page';
import TestPage from './TestPage';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  }
}));

const TestPageView = () => {
  const classes = useStyles();
  return (
    <Page
      className={classes.root}
      title="test page"
    >
      <Container maxWidth="lg">
        <TestPage />
      </Container>
    </Page>
  );
};

export default TestPageView;
