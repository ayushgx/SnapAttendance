import React, {useState, useEffect} from 'react';
import { makeStyles, ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CardActionArea from '@material-ui/core/CardActionArea';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';


import PropTypes from 'prop-types';

import Logout from './Logout';
import SignIn from './SignIn';
import SubjectDetail from './SubjectDetail';

const circularProgressTheme = createMuiTheme({
    palette: {
        primary:{
            main: '#34bf58'
        },
        secondary:{
            main: '#e05151'
        }
    }
})

const useStyles = makeStyles(theme => ({
    title: {
        fontSize: 14
    },
    content: {
        fontSize: 12
    },
    fullWidth: {
        width: "100%",
        marginBottom: theme.spacing(2)
    },
    spinner: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: theme.spacing(30)
    },
    boxGreen: {
        borderColor: '#34bf58'
    },
    boxRed: {
        borderColor: '#e05151'
    },
    circular: {
        position: 'absolute',
        top: '50%',
        right: '3%',
        transform: 'translateY(-50%)'
    },
}))

function CircularProgressWithLabel(props) {
    const classes = useStyles();
    return (
      <Box className={classes.circular} position="relative" display="inline-flex">
        <ThemeProvider theme={circularProgressTheme} >
        <CircularProgress size={80} variant="static"  {...props} />
        </ThemeProvider>
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h6" component="div" color="textPrimary">
              {props.value}
          </Typography>
        </Box>
      </Box>
    );
}
  
CircularProgressWithLabel.propTypes = {
    value: PropTypes.number.isRequired,
};

export default function DashBoard(props)
{
    const [attendance, setAttendance] = useState([])
    const [loading, setLoading] = useState(false)
    const [loggedIn, setLoggedIn] = useState(true);
    const [invalid, setInvalid] = useState(false);
    const [subject, setSubject] = useState({});
    const cacheMinute = 10;
    
    function logout() {
        localStorage.removeItem('uid')
        localStorage.removeItem('password')
        setLoggedIn(false);
    }

    function showSubject(subject){
        // console.log(subject)
        setSubject(subject);
    }

    function compareTitles(a, b)
    {
        if(a.Title < b.Title)
            return -1
        else if(a.Title > b.Title)
            return 1
        else
            return 0
    }

    useEffect(() => {
        if(loggedIn){
            if (localStorage.getItem('attendance') && (Date.now() - parseInt(localStorage.getItem('timestamp')) <= 1000 * 60 * cacheMinute)) {
                setAttendance(JSON.parse(localStorage.getItem('attendance')))
            }

            else {
                const formdata = new FormData()
                formdata.append('uid', localStorage.getItem('uid'))
                formdata.append('password', localStorage.getItem('password'))
                setLoading(true)
                try{
                    fetch('/api', {
                        method: 'POST',
                        body: formdata
                    }).then(data => data.json()).then(data => {

                        if (data.error) {
                            console.log('Looks like your UIMS password is changed!')
                            setInvalid(true);
                            logout();
                        }

                        else {
                            setLoading(false)
                            setAttendance(data)

                            localStorage.setItem('attendance', JSON.stringify(data))
                            localStorage.setItem('timestamp', Date.now())
                        }
                    }).catch(err => {
                        console.log(err)
                        setLoading(false);
                        if(localStorage.getItem('attendance')){
                            setAttendance(JSON.parse(localStorage.getItem('attendance')))
                        }
                        else{
                            logout()
                        }
                    })
                }
                catch (e) {
                    console.log(e)
                    setLoading(false);
                    if (localStorage.getItem('attendance')) {
                        setAttendance(JSON.parse(localStorage.getItem('attendance')))
                    }
                    else {
                        logout()
                    }
                }
            }
        }
    }, [loggedIn])  

    const classes = useStyles();


    if(loggedIn){
        return (
            
            !loading ? (
            (!Object.keys(subject).length) ? (
                <>
                    <AppBar position="fixed">
                        <Toolbar>
                            <Grid justify="space-between" container>
                                <Grid item>
                                    <Typography type='title' style={{marginTop: '5%'}}><strong>{Object(attendance[0])['name']}</strong> ({Object(attendance[0])['UId']})</Typography>
                                </Grid>
                                <Grid item>
                                    <IconButton onClick={props.changeTheme}>
                                        <Brightness4Icon style={{ color: '#fff' }} />
                                    </IconButton>
                                    <Logout onClick={logout} />
                                </Grid>
                            </Grid>
                        </Toolbar>
                    </AppBar>
                    <List component="ul" style={{ top: '60px' }}>
                        {attendance.sort(compareTitles).map(subject => (
                            <ListItem key={subject.Code}>
                                <CardActionArea>
                                    <Card className={classes.fullWidth} onClick={() => showSubject(subject)} elevation={10}>
                                        <Box className={(subject.colorcode === 'Green' && parseFloat(subject.EligibilityPercentage)>=75) ? classes.boxGreen : classes.boxRed} borderLeft={6}>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    {subject.Title.toUpperCase()}
                                                </Typography>
                                                <CircularProgressWithLabel value={parseFloat(subject.EligibilityPercentage)} color={(Isubject.colorcode === 'Green' && parseFloat(subject.EligibilityPercentage)>=75) ? 'primary' : 'secondary'} />
                                                <Typography variant="h6" color="textSecondary" className={classes.content}>
                                                    Total Attended: {subject.Total_Attd}
                                                </Typography>
                                                <Typography variant="h6" gutterBottom color="textSecondary" className={classes.content}>
                                                    Total Delivered: {subject.Total_Delv}
                                                </Typography>
                                                <Typography variant="overline" gutterBottom color="textPrimary" className={classes.content}>
                                                    [{subject.Code}]
                                                </Typography>
                                            </CardContent>
                                        </Box>
                                    </Card>
                                </CardActionArea>
                            </ListItem>
                        ))}
                    </List>
                </>
            ) : <SubjectDetail subject={subject} close={setSubject} />
        ) : (<div className={classes.spinner}> <CircularProgress /> </div>)
    
        )
    }
    else
        return invalid ? <SignIn message="Your UIMS Password Expired" /> : <SignIn/>
}
  
