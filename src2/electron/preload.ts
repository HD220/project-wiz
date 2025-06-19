import { contextBridge, ipcRenderer } from 'electron';
import type { NewJob, Job } from '../core/domain/schemas'; // Ajustar caminho se necessário

// API exposta para o Renderer Process
contextBridge.exposeInMainWorld('electronAPI', {
  queueAddJob: (jobData: NewJob): Promise<{success: boolean, job?: Job, error?: string}> =>
    ipcRenderer.invoke('queue:addJob', jobData),
  queueGetNextJob: (criteria?: { personaId?: string; excludedIds?: string[] }): Promise<{success: boolean, job?: Job | null, error?: string}> =>
    ipcRenderer.invoke('queue:getNextJob', criteria),
  queueCompleteJob: (jobId: string, result: any): Promise<{success: boolean, job?: Job | null, error?: string}> =>
    ipcRenderer.invoke('queue:completeJob', jobId, result),
  queueFailJob: (jobId: string, reason: string): Promise<{success: boolean, job?: Job | null, error?: string}> =>
    ipcRenderer.invoke('queue:failJob', jobId, reason),
});

// Código de loading original abaixo
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise(resolve => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child);
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child);
    }
  },
};

function useLoading() {
  const className = `loaders-css__square-spin`;
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `;
  const oStyle = document.createElement('style');
  const oDiv = document.createElement('div');

  oStyle.id = 'app-loading-style';
  oStyle.innerHTML = styleContent;
  oDiv.className = 'app-loading-wrap';
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`;

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle);
      safeDOM.append(document.body, oDiv);
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle);
      safeDOM.remove(document.body, oDiv);
    },
  };
}

const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);

window.onmessage = ev => {
  ev.data.payload === 'removeLoading' && removeLoading();
};

// Opcional: manter o setTimeout ou remover se o loading for removido de outra forma.
// Se o App.tsx for renderizado rapidamente, o loading pode ser removido pelo App.tsx
// enviando uma mensagem para window, ou o main process pode enviar uma mensagem
// quando a janela estiver pronta. Por ora, o setTimeout garante que ele desapareça.
setTimeout(removeLoading, 1000); // Reduzido o tempo para não atrapalhar os testes da UI
