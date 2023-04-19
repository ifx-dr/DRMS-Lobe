import React from 'react';
import { Container, makeStyles } from '@material-ui/core';
import Page from 'src/components/Page';
import CreateProposal from './CreateNewProp';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  }
}));

const CreateProposalView = () => {
  const classes = useStyles();
  return (
    <Page
      className={classes.root}
      title="Create new Proposal"
    >
      <Container maxWidth="lg">
        <CreateProposal />
      </Container>
    </Page>
  );
};

export default CreateProposalView;
