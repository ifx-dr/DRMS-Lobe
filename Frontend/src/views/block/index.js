import React from 'react';
import { Container, makeStyles } from '@material-ui/core';
import Page from 'src/components/Page';
import GenerateBlock from './GenerateBlock';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  }
}));

const GenerateBlockView = () => {
  const classes = useStyles();
  return (
    <Page
      className={classes.root}
      title="Generate a new block"
    >
      <Container maxWidth="lg">
        <GenerateBlock />
      </Container>
    </Page>
  );
};

export default GenerateBlockView;
