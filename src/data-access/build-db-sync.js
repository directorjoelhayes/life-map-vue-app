export default function buildDbSync(db) {

    //instance of the db

    //user if available

    //sub dbs
    const makeMeta = ({
        databaseId,
        instanceId,
        name,
        userId,
        syncOptions = {
            historySize: 1000,
            clearThreshold: {
                increment: 1100,
                clearNumber: 100
            }
        }
    } = {}) => {
        return {
            databaseId,
            instanceId,
            name,
            currentKey: '',
            updates: 0,
            userId,
            lastSync: null,
            syncOptions
        }
    }

    const meta = makeMeta({
        databaseId: 'meta',
        instanceId: 'meta',
        name: 'meta',
        userId: 'meta',
        //will allow syncing filters and other meta data
        syncOptions: {}
    })
    // updates
    const makeUpdates = ({

    } = {}) => {

        return {
            //if sync is set to master, there will be one master and many slaves
            master: null, //the master of the updates
            instanceId: '',
            //there could be multiple tabs open for the same instance
            //if in browser. Peers with same instance will refresh the database
            
            systemId: '',
            
            /*
                if sync is set to peer:

                peers will pick a random number, from 0 to 1000, and will send to all peers, with a
                timestamp. Your buddy will be the peer with the closest number, higher than yours.
                The buddy with the highest number will send to the lowest number.

                A peer will only forward to its buddy. It will send all updates to its buddy,
                except if it receives an update from its buddy (the buddy system will form a ring).

                If a peer joins, they will pick a random number, from 0 to 1000, and will send to all peers, with a
                timestamp. You'll keep send to your old buddy, and new buddy until you've successfully sent to your new buddy.
                
                If a peer drops out, you'll send to the next peer in the ring.

            */
            peers: [],
            updates: [],
            put(key, value) {
                updates.push({
                    key,
                    value
                })
            },
            del(key){
                updates.push({
                    key,
                    value: null
                })
            },
            sync(){
                this.peers.forEach(peer => {
                    peer.send(this.updates)
                })
            },
            onMessage(message) {
                this.updates.push(message)
            }
        }

    }
    // sync functions
    // data

    return {
        meta,
        updates,
        data
    }
}