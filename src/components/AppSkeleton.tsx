import {
  useMediaQuery,
  createMuiTheme,
  makeStyles,
  CssBaseline,
  ThemeProvider,
  AppBar,
  Hidden,
  IconButton,
  Toolbar,
  Typography,
  Divider,
  List,
  Drawer,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import {
  AccountCircle,
  ArrowBackIos,
  MoreVert,
  Menu as MenuIcon,
  Settings as SettingsIcon,
} from "@material-ui/icons";
import { Skeleton } from "@material-ui/lab";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

interface Props {}

const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
  toolbar: {
    ...theme.mixins.toolbar,
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 3),
    // justifyContent: 'flex-end'
  },
  root: {
    display: "flex",
  },
  drawer: {
    [theme.breakpoints.up("md")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    width: drawerWidth,
    "&::-webkit-scrollbar": {
      width: "0.5em",
    },
    "&::-webkit-scrollbar-track": {
      "box-shadow": "inset 0 0 6px rgba(0,0,0,0.5)",
      "border-radius": "10px",
    },
    "&::-webkit-scrollbar-thumb": {
      "background-color": "darkgrey",
      "border-radius": "10px",
      outline: "1px solid slategrey",
    },
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
}));

const AppSkeleton = (props: Props) => {
  const classes = useStyles();
  const preferDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: preferDarkMode ? "dark" : "light",
          primary: {
            main: preferDarkMode ? "#7986cb" : "#3f51b5",
          },
        },
      }),
    [preferDarkMode]
  );

  const drawer = useMemo(
    () => (
      <div>
        <div className={classes.toolbar}>
          <Skeleton variant="text" width="100%" />
        </div>
        <Divider></Divider>
        <List>
          {Array.from({ length: 20 }).map((_, id) => (
            <ListItem key={id}>
              <ListItemIcon>
                <Skeleton variant="circle" width={24} height={24} />
              </ListItemIcon>
              <ListItemText>
                <Skeleton variant="rect" width="100%" height={24} />
              </ListItemText>
            </ListItem>
          ))}
        </List>
      </div>
    ),
    [classes.toolbar]
  );

  const container =
    window !== undefined ? () => window.document.body : undefined;

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap classes={{ root: classes.title }}>
              Sekai Viewer <small>{process.env.REACT_APP_VERSION}</small>
            </Typography>
            <IconButton
              color="inherit"
              disableRipple
              style={{ padding: ".6rem" }}
              size="medium"
            >
              <ArrowBackIos fontSize="inherit" />
            </IconButton>
            <Hidden smDown implementation="css">
              <IconButton
                color="inherit"
                style={{ padding: ".6rem" }}
                size="medium"
              >
                <SettingsIcon fontSize="inherit" />
              </IconButton>
              <Link to="/user" style={{ color: theme.palette.common.white }}>
                <IconButton
                  color="inherit"
                  style={{ padding: ".6rem" }}
                  size="medium"
                >
                  <AccountCircle fontSize="inherit" />
                </IconButton>
              </Link>
            </Hidden>
            <Hidden mdUp implementation="css">
              <IconButton color="inherit">
                <MoreVert />
              </IconButton>
            </Hidden>
          </Toolbar>
        </AppBar>
        <nav className={classes.drawer}>
          <Hidden mdUp implementation="css">
            <Drawer
              container={container}
              variant="temporary"
              anchor={theme.direction === "rtl" ? "right" : "left"}
              open={false}
              classes={{
                paper: classes.drawerPaper,
              }}
              ModalProps={{
                keepMounted: true,
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
          <Hidden smDown implementation="css">
            <Drawer
              variant="permanent"
              open
              classes={{
                paper: classes.drawerPaper,
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
        </nav>
      </div>
    </ThemeProvider>
  );
};

export default AppSkeleton;
