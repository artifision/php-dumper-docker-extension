import {useEffect, memo} from 'react';
import {useTheme} from "@mui/material";
import Dump from "../models/Dump";

type DumpFrameProps = {
  dump: Dump
}

export default memo(function DumpFrame({dump} : DumpFrameProps) {
  const theme = useTheme();
  const backgroundColor = theme.palette.mode === 'dark' ? '#263238' : '#F9F9F9';

  const iframeCSS: string = `
  body {
    margin: 0;
    overflow: hidden;
    background-color: ${backgroundColor};
    font-size: 14px;
  }
  pre {
    margin: 0;
  }
`;
  useEffect(() => {
    window.addEventListener('message', resizeIframe);

    return () => {
      window.removeEventListener('message', resizeIframe);
    }
  }, []);

  const resizeIframe = (event: MessageEvent) => {
    if (event.data && event.data.type === 'iframeResize' && event.data.height && event.data.uid === dump.getUid()) {
      const iframeElement = document.getElementById('dump-iframe-' + dump.getUid());
      if (iframeElement) {
        iframeElement.style.height = event.data.height + 'px';
      }
    }
  };

  return (
    <iframe
      id={'dump-iframe-' + dump.getUid()}
      style={{border: 'none', borderRadius: '5px'}}
      src='about:blank'
      height={25}
      width='100%'
      ref={(iframe) => {
        if (iframe) {
          const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
          if (!iframeDocument) {
            return;
          }
          iframeDocument.open();
          iframeDocument.write('<style>' + iframeCSS + '<\/style>');
          iframeDocument.write(dump.getHtml());
          const iframeJS = `
function sendResizeMessage() {
  window.parent.postMessage({
    type: 'iframeResize',
    height: document.getElementsByClassName('sf-dump')[0].offsetHeight,
    uid: '${dump.getUid()}'
  }, "*");
}

document.addEventListener('click', sendResizeMessage);
window.addEventListener('load', sendResizeMessage);
    `;
          iframeDocument.write('<script>' + iframeJS + '<\/script>');
          iframeDocument.close();
        }
      }}
    />
  )
}, (prevProps, nextProps) => {
  return prevProps['dump'].getUid() === nextProps['dump'].getUid();
});