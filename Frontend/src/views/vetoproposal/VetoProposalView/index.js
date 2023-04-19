import React from 'react';
import { Container, makeStyles } from '@material-ui/core';
import Page from 'src/components/Page';
import VetoProposal from './CreateVetoProp';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  }
}));

const VetoProposalView = () => {
  const classes = useStyles();
  return (
    <Page
      className={classes.root}
      title="Create new Proposal"
    >
      <Container maxWidth="lg">
        <VetoProposal />
      </Container>
    </Page>
  );
};

export default VetoProposalView;
