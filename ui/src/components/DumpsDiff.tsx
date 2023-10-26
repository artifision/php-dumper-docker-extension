import Dump from "../models/Dump";
import Diff from "./Diff";
import React, {useEffect, useRef, useState} from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Modal,
  Radio,
  RadioGroup, Stack,
  Typography
} from "@mui/material";

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxHeight: '80%',
  overflow: 'auto',
  backgroundColor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function DumpsDiff({dump1, dump2, onClose}: { dump1: Dump, dump2: Dump, onClose: () => void }) {
  const [text1, setText1] = useState<string>('');
  const [text2, setText2] = useState<string>('');
  const [open, setOpen] = useState<boolean>(true);
  const [mode, setMode] = useState<'characters' | 'words'>('words');
  const tmpFrame = useRef<HTMLIFrameElement | null>(null);

  const textFromDump = (dump: Dump) => {
    const iframe = tmpFrame.current;
    if (!iframe) {
      return '';
    }

    const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
    if (!iframeDoc) {
      return '';
    }
    iframeDoc.write(dump.getHtml());
    iframeDoc.close();

    const text = iframeDoc.body.textContent;
    if (!text) {
      return '';
    }
    return text.trim().replace(/Sfdump\(.*?\)$/g, '');
  }

  const handleClose = () => {
    setOpen(false);
    onClose();
  }

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode(event.target.value as 'characters' | 'words');
  }

  useEffect(() => {
    setText1(textFromDump(dump1));
    setText2(textFromDump(dump2));
  }, []);

  return (
    <>
      <iframe ref={tmpFrame} src="about:blank" height={0} width={0} style={{display: 'none'}}/>

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4">Dumps Diff</Typography>
            <FormControl>
              <RadioGroup row onChange={handleTypeChange} value={mode}>
                <FormControlLabel value="characters" control={<Radio/>} label="Characters"/>
                <FormControlLabel value="words" control={<Radio/>} label="Words"/>
              </RadioGroup>
            </FormControl>
          </Stack>
          {text1 && text2 && <Diff string1={text1} string2={text2} mode={mode}/>}
          <Stack alignItems="end">
            <Button onClick={handleClose} variant="outlined" color="secondary">Close</Button>
          </Stack>
        </Box>
      </Modal>
    </>
  )
}