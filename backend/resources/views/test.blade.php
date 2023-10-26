<div id="dumps"></div>
<style>
    body {
        background-color: rgb(28, 38, 45);
        padding: 20px;
    }

    iframe {
        border: none;
        border-radius: 5px;
        margin: 5px 0;
    }

    #dumps {
        background-color: #fff;
        padding: 5px;
        border-radius: 5px;
    }
</style>
<script>
    const iframeCSS = `
            body {
              margin: 0;
              overflow: hidden;
            }
            pre {
              margin: 0;
            }
    `;

    let eventSource = null;

    function listenForDumps() {
        if (eventSource !== null && eventSource.readyState !== EventSource.CLOSED) {
            // EventSource is already open or in the process of opening, no need to recreate it.
            return;
        }

        // Close the existing EventSource if it exists
        if (eventSource !== null) {
            eventSource.close();
        }

        eventSource = new EventSource('/server/stream?theme=dark&depth=0');
        eventSource.onmessage = function (event) {
            const response = JSON.parse(event.data);
            const data = JSON.parse(response['dump']);
            console.log(data)
            const uid = data['uid'];
            const date = new Date(data['time'] * 1000);
            const dumps = document.getElementById('dumps');

            const iframeContainer = document.createElement('div');
            dumps.appendChild(iframeContainer);
            const iframe = document.createElement('iframe');
            iframe.src = 'about:blank';
            iframe.id = uid;
            iframe.width = '100%';
            iframe.height = '0';
            iframeContainer.appendChild(iframe);
            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            iframeDocument.open();

            iframeDocument.write('<style>' + iframeCSS + '<\/style>');
            iframeDocument.write(data['html']);
            const iframeJS = `
function sendResizeMessage() {
  window.parent.postMessage({
    type: 'iframeResize',
    height: document.getElementsByClassName('sf-dump')[0].offsetHeight,
    uid: '${uid}'
  }, "*");
}

document.addEventListener('click', sendResizeMessage);
window.addEventListener('load', sendResizeMessage);
    `;
            iframeDocument.write('<script>' + iframeJS + '<\/script>');
            iframeDocument.close();
        }

        eventSource.onerror = function (event) {
            if (event.readyState === EventSource.CLOSED) {
                console.log('Connection was closed.');
            } else {
                console.log('Error occurred:', event);
                eventSource.close();
                setTimeout(listenForDumps, 1000);
            }
        }
    }

    listenForDumps();

    setInterval(() => {
        fetch('/server/ping');
    }, 3000);

    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'iframeResize' && event.data.height) {
            document.getElementById(event.data.uid).style.height = event.data.height + 'px';
        }
    });
</script>
