import {styled} from '@mui/material/styles';
import {keyframes} from '@mui/system';
import {blueGrey} from "@mui/material/colors";
import {Stack} from "@mui/material";

const backgroundFadeDark = keyframes`
  from {
    background-color: ${blueGrey[700]};
  }
  to {
    background-color: ${blueGrey[900]};
  }
`;

const backgroundFadeLight = keyframes`
  from {
    background-color: ${blueGrey[100]};
  }
  to {
    background-color: ${blueGrey[50]};
  }
`;

const FlashStack = styled(Stack)(({theme}) => ({
  backgroundColor: blueGrey[theme.palette.mode === 'dark' ? 900 : 50],
  animation: `${theme.palette.mode === 'dark' ? backgroundFadeDark : backgroundFadeLight} 1s ease-out`,
}));

export default FlashStack;