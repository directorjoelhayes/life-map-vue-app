const isElectron = window.electron;
let apiUrl;
export const dataAccess = {
    executeCommand: (command) => {
        if (isElectron) {
            window.electron.send('executeCommand', command)
        }
        else {
            apiUrl = import.meta.env.VITE_API_URL

            return fetch(`${apiUrl}/execute-command?command=${command}`)
                .then(response => response.json());
        }
    },
    executeCommandInTerminal: (command) => {
        if (isElectron) {
            window.electron.send('executeCommandInTerminal', command)
        }
    },
    getFileDirectories: (drive) => {
        // if (isElectron) {
        //     return window.electron.ipcRenderer.invoke('get-search-data');
        // }

        if (isElectron) { apiUrl = "http://localhost:3011" }
        else { apiUrl = import.meta.env.VITE_API_URL }

        //url params for drive
        const urlParams = new URLSearchParams();
        urlParams.set('path', drive);

        return fetch(`${apiUrl}/index-drive?${urlParams.toString()}`)
            .then(response => response.json());
    },
    openInExplorer: (path) => {
        if (isElectron) { apiUrl = "http://localhost:3011" }
        else { apiUrl = import.meta.env.VITE_API_URL }

        return fetch(`${apiUrl}/open-in-explorer?path=${path}`)
            .then(response => response.json());
    },
    openInTerminal: (path) => {
        if (isElectron) { apiUrl = "http://localhost:3011" }
        else { apiUrl = import.meta.env.VITE_API_URL }

        return fetch(`${apiUrl}/open-in-terminal?path=${path}`)
            .then(response => response.json());
    },
    getFileBuffer: (path) => {
        if (isElectron) { apiUrl = "http://localhost:3011" }
        else { apiUrl = import.meta.env.VITE_API_URL }

        return fetch(`${apiUrl}/get-file-buffer?path=${path}`)
            .then(response => response.arrayBuffer());
    },
    uploadEncryptedFiles: async (files, targetPath) => {
        if (isElectron) { apiUrl = "http://localhost:3011" }
        else { apiUrl = import.meta.env.VITE_API_URL }

        const formData = new FormData();
        for (let file of files) {
            formData.append('files', file);
        }
        formData.append('targetPath', targetPath);

        return fetch(`${apiUrl}/upload-files-and-encrypt`, {
            method: 'POST',
            body: formData
        })
            .then(response => response.json());
    }
}