import {Link, Stack, Typography, useTheme} from '@mui/material';
import {createDockerDesktopClient} from '@docker/extension-api-client';
import {blueGrey, pink} from '@mui/material/colors';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import FavoriteIcon from '@mui/icons-material/Favorite';

import Dumps from "./components/Dumps";
import Logo from "./components/Logo";

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export function App() {
  const ddClient = useDockerDesktopClient();
  const theme = useTheme();

  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          backgroundColor: theme.palette.mode === 'dark' ? blueGrey[900] : blueGrey[50],
          border: '1px solid',
          borderRadius: 1,
          borderColor: theme.palette.mode === 'dark' ? blueGrey[800] : blueGrey[100],
          paddingX: 2,
          paddingY: 1,
        }}
      >
        <Stack alignItems="center">
          <Typography variant="h3">PHP Dumper</Typography>
          <Typography variant="body2">
            by <Link href="#" sx={{textDecoration: 'none'}}
                     onClick={() => ddClient.host.openExternal('https://artifision.com')}>Artifision</Link>
          </Typography>
        </Stack>
        <Logo />
        <Stack alignItems="end">
          <Link href="#" sx={{color: pink[300], '&:hover': {color: pink[200]}, textDecoration: 'none'}}
                onClick={() => ddClient.host.openExternal("https://github.com/sponsors/artifision")}>
            Sponsor <FavoriteIcon/>
          </Link>
          <Link href="#" sx={{textDecoration: 'none'}}
                onClick={() => ddClient.host.openExternal("https://forms.gle/72wpMPKJcnk81uDS9")}>
            Give Feedback <QuestionAnswerIcon/>
          </Link>
        </Stack>
      </Stack>
      <Stack>
        <Dumps/>
      </Stack>
    </Stack>
  );
}
