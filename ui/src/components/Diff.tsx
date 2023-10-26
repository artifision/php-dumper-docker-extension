import React, {useEffect, useState} from "react";
import * as diff from "diff";
import {Box, CircularProgress, useTheme} from "@mui/material";
import {Change} from "diff";

const styles = {
  added: {
    color: "green",
    backgroundColor: "#b5efdb"
  },
  removed: {
    color: "red",
    backgroundColor: "#fec4c0"
  }
};

type DiffProps = {
  string1: string;
  string2: string;
  mode?: "characters" | "words";
}

const Diff = ({string1, string2, mode = 'characters'}: DiffProps) => {
  const [mappedNodes, setMappedNodes] = useState<React.JSX.Element[] | null>(null);
  const [identical, setIdentical] = useState<boolean>(false);
  const theme = useTheme();

  useEffect(() => {
    setMappedNodes(null);
    if (string1 === string2) {
      setIdentical(true);
      return;
    }
    setIdentical(false);

    setTimeout(() => {
      let groups: Change[] = [];

      if (mode === 'characters') {
        groups = diff.diffChars(string1, string2);
      } else if (mode === 'words') {
        groups = diff.diffWords(string1, string2);
      }

      setMappedNodes(groups.map((group: Change, index: number) => {
        const {value, added, removed} = group;
        let nodeStyles;
        if (added) {
          nodeStyles = styles.added;
        }
        if (removed) {
          nodeStyles = styles.removed;
        }
        return <span key={index} style={nodeStyles}>{value}</span>;
      }));
    }, 100);

  }, [string1, string2, mode]);

  return <Box>
    {mappedNodes !== null ? <pre style={{
        backgroundColor: theme.palette.mode === 'dark' ? '#37474f' : '#eceff1',
        padding: 10,
        borderRadius: 5,
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
      }}>
        {mappedNodes}
    </pre> :
      <Box sx={{paddingY: 2, textAlign: 'center'}}>
        {identical ? <p>The dumps are identical</p> :
          <>
            <CircularProgress/>
            <p>
              Computing difference...
            </p>
          </>
        }
      </Box>}
  </Box>;
};

export default Diff;
