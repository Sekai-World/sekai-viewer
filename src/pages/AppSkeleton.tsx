import {
  useMediaQuery,
  CssBaseline,
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
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {
  createTheme,
  StyledEngineProvider,
  Theme,
  ThemeProvider,
} from "@mui/material/styles";
import {
  AccountCircle,
  ArrowBackIos,
  MoreVert,
  Menu as MenuIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { Skeleton } from "@mui/material";
import React, { Fragment, useMemo } from "react";
import { Link } from "react-router-dom";

declare module "@mui/styles/defaultTheme" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

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
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
}));

const AppSkeletonInner = (props: { theme: Theme }) => {
  const classes = useStyles();

  const { theme } = props;
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
                <Skeleton variant="circular" width={24} height={24} />
              </ListItemIcon>
              <ListItemText>
                <Skeleton variant="rectangular" width="100%" height={24} />
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
    <Fragment>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              className={classes.menuButton}
              size="large"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap classes={{ root: classes.title }}>
              Sekai Viewer <small>{import.meta.env.PACKAGE_VERSION}</small>
            </Typography>
            <IconButton
              color="inherit"
              disableRipple
              style={{ padding: ".6rem" }}
              size="medium"
            >
              <ArrowBackIos fontSize="inherit" />
            </IconButton>
            <Hidden mdDown implementation="css">
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
              <IconButton color="inherit" size="large">
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
          <Hidden mdDown implementation="css">
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
    </Fragment>
  );
};

const AppSkeleton = () => {
  const preferDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: preferDarkMode ? "dark" : "light",
          // primary: {
          //   main: preferDarkMode ? "#7986cb" : "#3f51b5",
          // },
          primary: {
            main: "#298a7b",
          },
          secondary: {
            main: "#f50057",
          },
          success: {
            main: "#1a8e1f",
          },
        },
      }),
    [preferDarkMode]
  );

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <AppSkeletonInner theme={theme} />
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default AppSkeleton;
