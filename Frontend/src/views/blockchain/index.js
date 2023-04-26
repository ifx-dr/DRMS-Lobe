import React from 'react';
import { Container, makeStyles} from '@material-ui/core';
import Page from 'src/components/Page';
import Blockchain from './BlockchainView';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  }
}));

const BlockchainView = () => {
  const classes = useStyles();
  return (
    <Page
      className={classes.root}
      title="View Blockchain"
    >
      <Container maxWidth="lg">
        <Blockchain />
      </Container>
    </Page>
  );
};

export default BlockchainView;
