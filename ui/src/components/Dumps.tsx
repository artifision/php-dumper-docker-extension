import React, {SyntheticEvent, useEffect, useRef, useState} from 'react';
import DumpFrame from "./DumpFrame";
import {
  Box, FormControl, FormControlLabel, FormGroup, IconButton, InputLabel, Link, MenuItem, Select,
  SelectChangeEvent, Slider, Stack, Switch, Tooltip, Typography, useTheme
} from "@mui/material";
import Grid from '@mui/material/Grid';
import {blueGrey} from "@mui/material/colors";
import FlashStack from "./FlashStack";
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DifferenceIcon from '@mui/icons-material/Difference';
import Dump from "../models/Dump";
import DumpsCollection from "../collections/DumpsCollection";
import {createDockerDesktopClient} from "@docker/extension-api-client";
import DumpsDiff from "./DumpsDiff";

const BACKEND_URL = 'http://localhost:9913';
let eventSource: EventSource | null = null;

const expirations: any = {
  0: 'No',
  100: '100ms',
  500: '500ms',
  1_000: '1s',
  2_000: '2s',
  3_000: '3s',
  4_000: '4s',
  5_000: '5s',
  10_000: '10s',
  30_000: '30s',
  60_000: '60s',
}

const depths: any = {
  0: 'No',
  1: '1 Level',
  2: '2 Levels',
  3: '3 Levels',
  4: '4 Levels',
  5: '5 Levels',
  10: '10 Levels',
}

const SHOW_CONTEXT_KEY = 'dpe_show_context';
const MAX_DUMPS_KEY = 'dpe_max_dumps';
const MAX_DEPTH_KEY = 'dpe_max_depth';
const MAX_SECONDS_KEY = 'dpe_max_seconds';
const DUMPS_KEY = 'dpe_dumps';

const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export default function Dumps() {
  const [dumps, setDumps] = useState<DumpsCollection>(DumpsCollection.fromJsonString(localStorage.getItem(DUMPS_KEY) || '[]'));
  const [showContext, setShowContext] = useState<boolean>(localStorage.getItem(SHOW_CONTEXT_KEY) === null || Boolean(localStorage.getItem(SHOW_CONTEXT_KEY)));
  const [maxDumps, setMaxDumps] = useState<number>(parseInt(localStorage.getItem(MAX_DUMPS_KEY) || '5'));
  const [maxDepth, setMaxDepth] = useState<number>(parseInt(localStorage.getItem(MAX_DEPTH_KEY) || '1'));
  const [maxMilliseconds, setMaxMilliseconds] = useState<number>(parseInt(localStorage.getItem(MAX_SECONDS_KEY) || '0'));
  const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false);
  const [compareUIDs, setCompareUIDs] = useState<string[]>([]);
  const dumpsEndRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const ddClient = useDockerDesktopClient();

  useEffect(() => {
    const pingInterval = setInterval(() => fetch(`${BACKEND_URL}/server/ping`), 3000);

    startListening();

    return () => {
      clearInterval(pingInterval);
      stopListening();
    }
  }, [maxDumps, maxDepth, maxMilliseconds, theme]);

  const stopListening = () => {
    if (eventSource !== null) {
      eventSource.close();
      eventSource = null;
    }
    console.log('stop');
    return fetch(`${BACKEND_URL}/server/stop`);
  }

  const startListening = () => {
    console.log('start');
    eventSource = new EventSource(`${BACKEND_URL}/server/stream?theme=${theme.palette.mode}&depth=${maxDepth}`);
    eventSource.onmessage = function (event) {
      const response = JSON.parse(event.data);
      let data = JSON.parse(response['dump']);
      console.log(data);
      setDumps(prev => prev.push(Dump.fromJson(data), maxDumps, maxMilliseconds));
      setTimeout(() => dumpsEndRef.current?.scrollIntoView({behavior: "smooth"}), 100);
    }

    eventSource.onerror = () => {
      console.log('error');
      stopListening().then(() => setTimeout(() => startListening(), 2000));
    }

    return eventSource;
  }

  const handleContextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowContext(event.target.checked);
    localStorage.setItem(SHOW_CONTEXT_KEY, event.target.checked ? '1' : '');
  }

  const handleMaxMillisecondsChange = (event: SelectChangeEvent<number>) => {
    setMaxMilliseconds(parseInt(event.target.value as string));
    localStorage.setItem(MAX_SECONDS_KEY, event.target.value as string);
  }

  const handleMaxDumpsChange = (event: Event | SyntheticEvent<Element, Event>, value: number | number[]) => {
    if (typeof value === 'number') {
      setMaxDumps(value);
      localStorage.setItem(MAX_DUMPS_KEY, value.toString());
    }
  }

  const handleMaxDepthChange = (event: SelectChangeEvent<number>) => {
    setMaxDepth(parseInt(event.target.value as string));
    localStorage.setItem(MAX_DEPTH_KEY, event.target.value as string);
  }

  const deleteDump = (dump: Dump) => {
    setDumps(prev => prev.delete(dump));
  }

  const pinDump = (dump: Dump) => {
    setDumps(prev => prev.pin(dump));
  }

  const unpinDump = (dump: Dump) => {
    setDumps(prev => prev.unpin(dump));
  }

  const deleteDumps = () => {
    setDumps(prev => prev.removeUnpinned());
  }

  const setDumpCompare = (dump: Dump, compare: boolean) => {
    setCompareUIDs(prev => {
      if (compare) {
        return [...prev, dump.getUid()];
      } else {
        return prev.filter(uid => uid !== dump.getUid());
      }
    });
  };

  const keepFirstDumpForCompare = () => {
    setCompareUIDs(prev => {
      const found = dumps.getByUIDs(prev).map(dump => dump.getUid());

      return found.length > 0 ? [found[0]] : [];
    });
  }

  useEffect(() => {
    localStorage.setItem(DUMPS_KEY, JSON.stringify(dumps));
  }, [dumps]);

  const handleScroll = () => {
    if (window.scrollY > 1200) {
      setShowScrollToTop(prev => !prev ? true : prev);
    } else {
      setShowScrollToTop(prev => prev ? false : prev);
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const compareDumps = dumps.getByUIDs(compareUIDs);

  return (
    <Stack>
      {compareDumps.length === 2 &&
          <DumpsDiff dump1={compareDumps[0]} dump2={compareDumps[1]}
                     onClose={keepFirstDumpForCompare}/>}
      <Box sx={{
        backgroundColor: theme.palette.mode === 'dark' ? blueGrey[900] : blueGrey[50],
        border: '1px solid',
        borderRadius: 1,
        borderColor: theme.palette.mode === 'dark' ? blueGrey[800] : blueGrey[100],
        marginY: 1,
        paddingX: 4,
        paddingY: 1,
      }}>
        <Grid container columnSpacing={{xs: 4}}>
          <Grid item xs={12} sm={3}>
            <Typography variant="body1">Max Dumps</Typography>
            <Slider min={1} max={20} size="small"
                    valueLabelDisplay="auto"
                    defaultValue={maxDumps}
                    onChangeCommitted={handleMaxDumpsChange}/>
          </Grid>
          <Grid item xs={4} sm={3}>
            <Tooltip title="Applies only to new dumps." placement="top">
              <FormControl fullWidth variant="filled">
                <InputLabel id="expand-label">Expand</InputLabel>
                <Select
                  labelId="expand-label"
                  id="expand-select"
                  value={maxDepth}
                  onChange={handleMaxDepthChange}
                >
                  {Object.keys(depths).map((depth) => {
                    return <MenuItem key={depth} value={depth}>{depths[depth]}</MenuItem>;
                  })}
                </Select>
              </FormControl>
            </Tooltip>
          </Grid>
          <Grid item xs={4} sm={3}>
            <Tooltip title="Show only dumps captured within the selected time frame." placement="top">
              <FormControl fullWidth variant="filled">
                <InputLabel id="auto-delete-label">Time Frame</InputLabel>
                <Select
                  labelId="auto-delete-label"
                  id="auto-delete-select"
                  value={maxMilliseconds}
                  onChange={handleMaxMillisecondsChange}
                >
                  {Object.keys(expirations).map((seconds) => {
                    return <MenuItem key={seconds} value={seconds}>{expirations[seconds]}</MenuItem>;
                  })}
                </Select>
              </FormControl>
            </Tooltip>
          </Grid>
          <Grid item xs={2} sm={2}>
            <FormGroup>
              <FormControlLabel control={<Switch onChange={handleContextChange} checked={showContext}/>}
                                labelPlacement="top" label="Detailed"/>
            </FormGroup>
          </Grid>
          <Grid item xs={2} sm={1}>
            <Tooltip title="Delete all except pinned dumps.">
              <IconButton sx={{marginTop: 1}} color="error" onClick={deleteDumps}>
                <DeleteIcon/>
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>
      {dumps.isEmpty() &&
          <Stack sx={{padding: 20, gap: 15, alignItems: 'center'}}>
              <Typography sx={{color: blueGrey[300]}}>Listening for dumps...</Typography>
              <Link href="#" sx={{textDecoration: 'none', textAlign: 'center'}}
                    onClick={() => ddClient.host.openExternal("https://github.com/artifision/php-dumper-docker-extension#readme")}>
                  See the configuration guide <OpenInNewIcon/>
              </Link>
          </Stack>
      }
      {dumps.map((dump: Dump) => {
        const dumpSource: string = dump.getSource().slice(1);
        const requestUri: string | undefined = dump.getRequestUri();
        const requestMethod: string | undefined = dump.getRequestMethod();

        return <FlashStack key={dump.getUid()} sx={{
          border: '1px solid',
          borderRadius: 1,
          backgroundColor: theme.palette.mode === 'dark' ? blueGrey[900] : blueGrey[50],
          borderColor: theme.palette.mode === 'dark' ? blueGrey[700] : blueGrey[100],
          marginY: 1,
          paddingX: 2,
          paddingY: 1,
          gap: 1,
        }}>
          {showContext &&
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%'}}>
                  <Stack direction="row" alignItems="center" sx={{width: '80%'}}>
                    {requestMethod && <Typography variant="body1"
                                                  color={dump.getMethodColor()}
                                                  sx={{fontWeight: 800}}>
                      {requestMethod}
                    </Typography>}
                    {requestUri && <Typography variant="body2"
                                               color={theme.palette.mode === 'dark' ? blueGrey[200] : blueGrey[600]}
                                               title={requestUri}
                                               sx={{
                                                 overflow: 'hidden',
                                                 textOverflow: 'ellipsis',
                                                 whiteSpace: 'nowrap',
                                                 marginLeft: 1,
                                               }}>
                      {requestUri}
                    </Typography>}
                  </Stack>

                  <Stack direction="row">
                      <Tooltip title="Compare">
                          <IconButton color="success" size="medium" sx={{padding: 0}}
                                      onClick={() => setDumpCompare(dump, !compareUIDs.includes(dump.getUid()))}>
                              <DifferenceIcon fontSize="small"
                                              color={compareUIDs.includes(dump.getUid()) ? 'success' : 'inherit'}/>
                          </IconButton>
                      </Tooltip>
                      <Tooltip title={dump.isPinned() ? 'Unpin' : 'Pin'}>
                          <IconButton color="success" size="medium" sx={{padding: 0}}
                                      onClick={() => dump.isPinned() ? unpinDump(dump) : pinDump(dump)}>
                              <BookmarkIcon fontSize="small" color={dump.isPinned() ? 'success' : 'inherit'}/>
                          </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                          <IconButton color="error" size="medium" sx={{padding: 0}} onClick={() => deleteDump(dump)}>
                              <DeleteForeverIcon fontSize="small"/>
                          </IconButton>
                      </Tooltip>
                  </Stack>
              </Stack>}
          <DumpFrame dump={dump}/>
          {showContext && <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color={blueGrey[400]}
                          title={dump.getISOTime()}>{dump.getHumanDateTime()}</Typography>
              <Typography variant="body2" color={blueGrey[400]}
                          title={dumpSource}
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            width: '65%',
                            direction: 'rtl'
                          }}>{dumpSource}</Typography>
          </Stack>}
        </FlashStack>
      })}
      {showScrollToTop &&
          <IconButton sx={{
            position: 'fixed',
            bottom: 60,
            right: 12,
            zIndex: 1000,
            backgroundColor: theme.palette.mode === 'dark' ? blueGrey[900] : blueGrey[50],
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? blueGrey[700] : blueGrey[100],
          }} onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <ExpandLessIcon/>
          </IconButton>
      }
      <Stack ref={dumpsEndRef}/>
    </Stack>
  );
}