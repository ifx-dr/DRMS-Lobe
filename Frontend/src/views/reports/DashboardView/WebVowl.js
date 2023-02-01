import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  useTheme,
  makeStyles,
  colors
} from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';

const useStyles = makeStyles(() => ({
  root: {}
}));

const WebVowl = ({ className, ...rest }) => {
  const classes = useStyles();
  const theme = useTheme();

  const data = {
    datasets: [
      {
        backgroundColor: colors.indigo[500],
        data: [18, 5, 19, 27, 29, 19, 20],
        label: 'This year'
      },
      {
        backgroundColor: colors.grey[200],
        data: [11, 20, 12, 29, 30, 25, 13],
        label: 'Last year'
      }
    ],
    labels: ['1 Aug', '2 Aug', '3 Aug', '4 Aug', '5 Aug', '6 Aug']
  };


  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <CardHeader
        title="WebVOWL"
      />
      <Divider />
      <CardContent>
        <Box
          height={600}
          position="relative"
        >
          {/* <iframe src="http://www.visualdataweb.de/webvowl/" height="600" width="1200"/> */}
          {/* <iframe src="http://vowl.visualdataweb.org/webvowl-old/webvowl-old.html" height="600" width="1200"/> */}
          <iframe src="http://vowl.visualdataweb.org/webvowl-old/webvowl-old.html" height="100%" width="100%"/>
        </Box>
      </CardContent>
      <Divider />
    </Card>
  );
};

WebVowl.propTypes = {
  className: PropTypes.string
};

export default WebVowl;
