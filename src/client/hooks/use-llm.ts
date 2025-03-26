import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export function useLLM() {
  const [download, setDownload] = useState(0);
  const [load, setLoad] = useState(0);

  const setDownloadDebounced = useDebouncedCallback(setDownload, 100, {
    maxWait: 1000,
  });

  const setLoadDebounced = useDebouncedCallback(setLoad, 100, {
    maxWait: 1000,
  });

  useEffect(() => {
    // const listenerDownload = window.electronAPI.onDownloadProgress(
    //   ({ progress }) => {
    //     setDownloadDebounced(progress);
    //   }
    // );
    // const listenerLoad = window.electronAPI.onLoadProgress(({ progress }) => {
    //   setLoadDebounced(progress);
    // });
    // return () => {
    //   listenerDownload();
    //   listenerLoad();
    // };
  }, []);

  return {
    state: {
      download: download * 100.0,
      load: load * 100.0,
    },
  };
}
