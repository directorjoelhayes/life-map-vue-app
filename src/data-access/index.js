const actions = {};

import { useRouter } from 'vue-router'

//electron
if(window.electron){
    actions.executeCommand = (command) => window.electron.send('executeCommand', command)
    actions.executeCommandInTerminal = (command) => window.electron.send('executeCommandInTerminal', command)
    actions.openPage = (url) => window.electron.send('openPage', url)
    actions.getFileDirectories = (drive) => window.electron.send('getFileDirectories', drive)
    actions.getSearchData = () => window.electron.send('getSearchData')
}
//browser
else {
    const apiUrl = import.meta.env.VITE_PUBLIC_SERVER_ENDPOINT
    
    // SSE connection management
    let eventSource = null;
    const eventListeners = new Map();
    
    const closeEventSource = () => {
        if (eventSource) {
            eventSource.close();
            eventSource = null;
        }
    };
    
    const startAction = async (action, args = {}) => {
        const query = new URLSearchParams(args).toString();
        // Set up EventSource to listen for updates
        eventSource = new EventSource(`${apiUrl}/action/${action}?${query}`); //TODO: add action to the url
        
        eventSource.onmessage = (event) => {
            try {
                console.log(event, "event");
                const data = JSON.parse(event.data);
                console.log('SSE Data received:', data);
                
                // Notify listeners
                if (eventListeners.has(action)) {
                    eventListeners.get(action).forEach(callback => {
                        callback(data);
                    });
                }
                
                // Handle completion
                if (data.type === 'complete') {
                    console.log(data.payload);
                    closeEventSource();
                } else if (data.type === 'error') {
                    console.log(data.payload.message);
                    closeEventSource();
                }
            } catch (err) {
                console.error('Error parsing SSE data:', err);
                closeEventSource();
            }
        };
        
        eventSource.onerror = (event) => {
            console.error('SSE Error:', event);
            reject(new Error('Connection error occurred'));
            closeEventSource();
        };
        
        eventSource.onopen = () => {
            console.log('SSE Connection opened for action:', action);
        };

        return eventSource;
    };
    
    // Helper to add event listeners for specific actions
    const addActionListener = (action, callback) => {
        if (!eventListeners.has(action)) {
            eventListeners.set(action, []);
        }
        eventListeners.get(action).push(callback);
    };
    
    // Helper to remove event listeners
    const removeActionListener = (action, callback) => {
        if (eventListeners.has(action)) {
            const listeners = eventListeners.get(action);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    };
    
    // Convert existing actions to use SSE pattern
    actions.executeCommand = (command) => startAction('executeCommand', { command })
    actions.executeCommandInTerminal = (command) => startAction('executeCommandInTerminal', { command })
    actions.openPage = (url) => {
        // Direct action for opening pages - no SSE needed
        window.open(url, '_blank')
        return Promise.resolve()
    }
    actions.getFileDirectories = (drive) => startAction('getFileDirectories', { drive })
    actions.getSearchData = () => startAction('getSearchData')
    actions.testAction = () => startAction('testAction', { command: 'testAction' })
    
    // Export utilities for advanced SSE usage
    actions.startAction = startAction
    actions.addActionListener = addActionListener
    actions.removeActionListener = removeActionListener
    actions.closeEventSource = closeEventSource
}

//TODO write later
//android 

//TODO write later
//ios

export {
    actions
}